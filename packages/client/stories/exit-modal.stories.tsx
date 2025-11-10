import type { Meta, StoryObj } from '@storybook/nextjs'
import ExitModal from '@/app/exit-modal'

const meta = {
  component: ExitModal,
  title: 'Exit Modal',
} satisfies Meta<typeof ExitModal>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    confirm: () => console.log('exiting'),
    close: () => console.log('closing'),
  },
}
