/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your MasterChess login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>♟ MASTERCHESS</Text>
          <Heading style={h1}>Your Login Link</Heading>
          <Text style={text}>
            Click below to log in to <strong style={gold}>{siteName}</strong>. This link expires shortly for your security.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>Log In to MasterChess</Button>
          </Section>
          <Text style={smallText}>Or paste this link into your browser:</Text>
          <Text style={linkText}><Link href={confirmationUrl} style={link}>{confirmationUrl}</Link></Text>
          <Hr style={hr} />
          <Text style={footer}>If you didn't request this link, you can safely ignore this email.</Text>
          <Text style={footer}>— The MasterChess Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif", margin: 0, padding: '40px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const card = { backgroundColor: '#0B0A09', borderRadius: '12px', padding: '40px 32px', border: '1px solid #2A2520' }
const brand = { fontFamily: "'Orbitron', Arial, sans-serif", fontSize: '14px', letterSpacing: '0.25em', color: '#E5B84A', margin: '0 0 24px', fontWeight: 700 as const }
const h1 = { fontFamily: "'Orbitron', Arial, sans-serif", fontSize: '24px', fontWeight: 700 as const, color: '#F4EAD0', margin: '0 0 24px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#D9CFB8', lineHeight: '1.6', margin: '0 0 16px' }
const gold = { color: '#E5B84A' }
const buttonWrap = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#E5B84A', color: '#0B0A09', fontSize: '15px', fontWeight: 600 as const, borderRadius: '12px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '13px', color: '#A89B7E', margin: '20px 0 4px' }
const linkText = { fontSize: '12px', color: '#A89B7E', wordBreak: 'break-all' as const, margin: '0 0 16px' }
const link = { color: '#E5B84A', textDecoration: 'underline' }
const hr = { borderColor: '#2A2520', margin: '28px 0 20px' }
const footer = { fontSize: '12px', color: '#A89B7E', margin: '6px 0', lineHeight: '1.5' }
