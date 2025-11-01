import type { Meta, StoryObj } from '@storybook/nextjs'
import { DownloadAllBtn } from '@/app/download-all-btn'

const meta = {
  component: DownloadAllBtn,
  title: 'Download All Button',
} satisfies Meta<typeof DownloadAllBtn>

export default meta

type Story = StoryObj<typeof meta>

const files: File[] = []

export const Primary: Story = {
  args: {
    files,
  },
}
