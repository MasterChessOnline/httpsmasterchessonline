/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your MasterChess verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>♟ MASTERCHESS</Text>
          <Heading style={h1}>Confirm Reauthentication</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Hr style={hr} />
          <Text style={footer}>This code expires shortly. If you didn't request this, you can safely ignore this email.</Text>
          <Text style={footer}>— The MasterChess Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif", margin: 0, padding: '40px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const card = { backgroundColor: '#0B0A09', borderRadius: '12px', padding: '40px 32px', border: '1px solid #2A2520', textAlign: 'center' as const }
const brand = { fontFamily: "'Orbitron', Arial, sans-serif", fontSize: '14px', letterSpacing: '0.25em', color: '#E5B84A', margin: '0 0 24px', fontWeight: 700 as const }
const h1 = { fontFamily: "'Orbitron', Arial, sans-serif", fontSize: '24px', fontWeight: 700 as const, color: '#F4EAD0', margin: '0 0 24px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#D9CFB8', lineHeight: '1.6', margin: '0 0 24px' }
const codeStyle = {
  fontFamily: "'Orbitron', 'Courier New', monospace",
  fontSize: '36px',
  fontWeight: 700 as const,
  color: '#E5B84A',
  letterSpacing: '0.4em',
  backgroundColor: '#1A1612',
  border: '1px solid #2A2520',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 28px',
}
const hr = { borderColor: '#2A2520', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#A89B7E', margin: '6px 0', lineHeight: '1.5' }
