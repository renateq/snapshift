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
)

type Message struct {
	Type  string `json:"type"`
	ID    string `json:"id,omitempty"`
	Error string `json:"error,omitempty"`
}

type Client struct {
	conn      *websocket.Conn
	writeLock sync.Mutex
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

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// For production, restrict origins properly.
		return true
	},
}

var (
	mapsLock sync.Mutex
	waiting  = make(map[string]*Client)  // socketID -> Client (waiting for a pair)
	pairings = make(map[*Client]*Client) // client -> paired client
)

func handleWS(w http.ResponseWriter, r *http.Request) {
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

		fmt.Println("Message type:", messageType)

		var msg Message
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("invalid json: %s\n", string(raw))
			_ = client.Send(Message{Type: "error", Error: "invalid JSON"})
			continue
		}

		switch msg.Type {
		case "register":
			id := uuid.NewString()
			mapsLock.Lock()
			waiting[id] = client
			mapsLock.Unlock()
			if err := client.Send(Message{Type: "registered", ID: id}); err != nil {
				log.Println("send registered error:", err)
			}
		case "connect":
			if msg.ID == "" {
				_ = client.Send(Message{Type: "error", Error: "missing id"})
				continue
			}

			mapsLock.Lock()
			target, ok := waiting[msg.ID]
			if !ok {
				mapsLock.Unlock()
				_ = client.Send(Message{Type: "error", Error: "invalid ID"})
				continue
			}

			// create 2-way pairing
			pairings[client] = target
			pairings[target] = client

			// remove from waiting set
			delete(waiting, msg.ID)
			mapsLock.Unlock()

			_ = client.Send(Message{Type: "connected"})
			_ = target.Send(Message{Type: "connected"})

		case "disconnect":
			cleanupClient(client)

		default:
			_ = client.Send(Message{Type: "error", Error: "Unknown message type"})
		}
	}
}

func cleanupClient(c *Client) {
	mapsLock.Lock()
	defer mapsLock.Unlock()

	// Remove from waiting (if any)
	for id, cl := range waiting {
		if cl == c {
			delete(waiting, id)
			break
		}
	}

	// Notify and unlink pair if exists
	if peer, ok := pairings[c]; ok && peer != nil {
		_ = peer.Send(Message{Type: "disconnected"})
		delete(pairings, peer)
		delete(pairings, c)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	http.HandleFunc("/ws", handleWS)

	fmt.Println("WebSocket signaling server listening on :" + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
