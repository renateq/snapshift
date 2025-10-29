import type { Meta, StoryObj } from '@storybook/nextjs'
import { TermsOfUse } from '@/app/terms-of-use'

const meta = {
  component: TermsOfUse,
  title: 'Terms of Use',
} satisfies Meta<typeof TermsOfUse>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}
