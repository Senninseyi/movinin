import React from 'react'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import Env from '../config/env.config'

import '../assets/css/agency-badge.css'

function AgencyBadge({
    agency
}: {
    agency: movininTypes.User
}) {
  return agency
        ? (
          <div className="agency-badge">
            <span className="agency-badge-logo">
              <img
                src={movininHelper.joinURL(Env.CDN_USERS, agency.avatar)}
                alt={agency.fullName}
              />
            </span>
            {agency.fullName}
          </div>
)
        : <></>
}

export default AgencyBadge
