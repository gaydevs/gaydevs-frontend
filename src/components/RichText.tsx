import { Fragment } from 'react'
import type { Paragraph } from '../types/content'

export function RichText({ parts }: { parts: Paragraph }) {
  return <>{parts.map((part, index) => part.strong ? <strong key={index}>{part.text}</strong> : <Fragment key={index}>{part.text}</Fragment>)}</>
}
