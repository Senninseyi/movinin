import React from 'react'
import {
    Check as AvailableIcon,
    Clear as UnavailableIcon
} from '@mui/icons-material'
import { strings } from '../lang/available'

import '../assets/css/available.css'

function Available({
        available,
        className
    }: {
        available: boolean
        className?: string
    }) {
  return (
    <div
      className={`label ${available ? 'available' : 'unavailable'}${className ? ` ${className}` : ''}`}
      title={available ? strings.AVAILABLE_INFO : strings.UNAVAILABLE_INFO}
    >
      {available ? <AvailableIcon className="label-icon" /> : <UnavailableIcon className="label-icon" />}
      <span>
        {' '}
        {available ? strings.AVAILABLE : strings.UNAVAILABLE}
        {' '}
      </span>
    </div>
  )
}

export default Available
