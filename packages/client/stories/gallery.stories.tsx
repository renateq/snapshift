import type { Meta, StoryObj } from '@storybook/nextjs'
import { makeImageFile } from './utils'
import { Gallery } from '@/app/gallery'

const meta = {
  component: Gallery,
  title: 'Gallery',
} satisfies Meta<typeof Gallery>

export default meta

type Story = StoryObj<typeof meta>

const files: File[] = Array.from<File>({ length: 5 }).fill(makeImageFile())

export const Primary: Story = {
  args: {
    files,
  },
}
