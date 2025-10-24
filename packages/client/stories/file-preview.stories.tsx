import { FilePreview } from '@/app/file-preview'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { makeImageFile } from './utils'

const meta = {
  component: FilePreview,
} satisfies Meta<typeof FilePreview>

export default meta

type Story = StoryObj<typeof meta>

const file = makeImageFile()

console.log(file)

export const Primary: Story = {
  args: {
    file,
  },
}
