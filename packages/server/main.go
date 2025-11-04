package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type Message struct {
	Type     string `json:"type"`
	ID       string `json:"id,omitempty"`
	Error    string `json:"error,omitempty"`
	FileMeta struct {
		Mime string `json:"mime,omitempty"`
	} `json:"fileMeta,omitempty"`
}

type Client struct {
	conn      *websocket.Conn
	writeLock sync.Mutex
}

type FileMeta struct {
	Size int64  `json:"size"`
	Env  string `json:"environment"`
}

func (c *Client) Send(msg Message) error {
	c.writeLock.Lock()
	defer c.writeLock.Unlock()

	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Client) SendRaw(raw []byte) error {
	c.writeLock.Lock()
	defer c.writeLock.Unlock()

	return c.conn.WriteMessage(websocket.BinaryMessage, raw)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// For production, restrict origins properly.
		return true
	},
}

var (
	waitingLock  sync.Mutex
	pairingsLock sync.Mutex
	waiting      = make(map[string]*Client)  // socketID -> Client (waiting for a pair)
	pairings     = make(map[*Client]*Client) // client -> paired client
)

func handleWS(w http.ResponseWriter, r *http.Request, supabaseClient *supabase.Client, env string) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	client := &Client{conn: ws}

	defer func() {
		cleanupClient(client)
		ws.Close()
	}()

	for {
		messageType, raw, err := ws.ReadMessage()
		if err != nil {
			log.Printf("read error: %v\n", err)
			return
		}

		if messageType == websocket.BinaryMessage {
			pairingsLock.Lock()
			peer := pairings[client]
			pairingsLock.Unlock()
			if peer == nil {
				log.Printf("no peer found for client")
				continue
			}

			entry := FileMeta{Size: int64(len(raw)), Env: "dev"}
			if env == "prod" {
				entry.Env = "prod"
			}
			_, _, err := supabaseClient.From("files").Insert(entry, false, "", "none", "").Execute()
			if err != nil {
				log.Println(err)
			}
			_ = peer.SendRaw(raw)
		} else if messageType == websocket.TextMessage {
			var msg Message
			if err := json.Unmarshal(raw, &msg); err != nil {
				log.Printf("invalid json: %s\n", string(raw))
				_ = client.Send(Message{Type: "error", Error: "invalid JSON"})
				continue
			}

			switch msg.Type {
			case "register":
				id := uuid.NewString()
				waitingLock.Lock()
				waiting[id] = client
				waitingLock.Unlock()
				if err := client.Send(Message{Type: "registered", ID: id}); err != nil {
					log.Println("send registered error:", err)
				}
			case "connect":
				fmt.Println("connecting", msg.ID)
				if msg.ID == "" {
					_ = client.Send(Message{Type: "error", Error: "missing id"})
					continue
				}

				waitingLock.Lock()
				target, ok := waiting[msg.ID]
				if !ok {
					waitingLock.Unlock()
					_ = client.Send(Message{Type: "error", Error: "invalid ID"})
					continue
				}

				// create 2-way pairing
				pairings[client] = target
				pairings[target] = client

				// remove from waiting set
				delete(waiting, msg.ID)
				waitingLock.Unlock()

				_ = client.Send(Message{Type: "connected"})
				_ = target.Send(Message{Type: "connected"})

			case "disconnect":
				cleanupClient(client)

			case "received":
				pairingsLock.Lock()
				peer := pairings[client]
				pairingsLock.Unlock()
				if peer == nil {
					log.Printf("no peer found for client")
					continue
				}
				_ = peer.Send(Message{Type: "received"})

			default:
				_ = client.Send(Message{Type: "error", Error: "Unknown message type"})
			}
		}

	}
}

func cleanupClient(c *Client) {
	// Remove from waiting (if any)
	waitingLock.Lock()
	for id, cl := range waiting {
		if cl == c {
			delete(waiting, id)
			break
		}
	}
	waitingLock.Unlock()

	// Notify and unlink pair if exists
	pairingsLock.Lock()
	if peer, ok := pairings[c]; ok && peer != nil {
		_ = peer.Send(Message{Type: "disconnected"})
		delete(pairings, peer)
		delete(pairings, c)
	}
	pairingsLock.Unlock()
}

func init() {
	_ = godotenv.Load()
}

func main() {
	// Supabase
	API_URL := os.Getenv("API_URL")
	API_KEY := os.Getenv("API_KEY")

	supabaseClient, err := supabase.NewClient(API_URL, API_KEY, nil)
	if err != nil {
		log.Fatalln("Failed to initialize the client: ", err)
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "dev"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWS(w, r, supabaseClient, env)
	})

	fmt.Println("WebSocket signaling server listening on :" + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
