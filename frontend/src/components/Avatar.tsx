import React, { useState, useEffect } from 'react'
import {
  Button, Avatar as MaterialAvatar,
  Badge,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  AccountCircle,
  PhotoCamera as PhotoCameraIcon,
  BrokenImageTwoTone as DeleteIcon
} from '@mui/icons-material'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import Env from '../config/env.config'
import * as Helper from '../common/Helper'
import { strings as commonStrings } from '../lang/common'
import * as UserService from '../services/UserService'

function Avatar({
    loggedUser,
    user: avatarUser,
    size,
    readonly,
    color,
    className,
    onBeforeUpload,
    onChange,
  }:
    {
      loggedUser?: movininTypes.User
      user?: movininTypes.User
      size: 'small' | 'medium' | 'large',
      readonly?: boolean,
      color?: 'disabled' | 'action' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
      className?: string,
      onBeforeUpload?: () => void,
      onChange?: (user: movininTypes.User) => void,
    }) {
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<movininTypes.User>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) {
      Helper.error()
      return
    }

    if (onBeforeUpload) {
      onBeforeUpload()
    }

    const { _id } = user

    if (!_id) {
      Helper.error()
      return
    }

    const reader = new FileReader()
    const file = e.target.files[0]

    reader.onloadend = async () => {
      try {
        const status = await UserService.updateAvatar(_id, file)

        if (status === 200) {
          const _user = await UserService.getUser(_id)

          if (_user) {
            setUser(_user)

            if (onChange) {
              onChange(_user)
            }
          } else {
            Helper.error()
          }
        } else {
          Helper.error()
        }
      } catch (err) {
        Helper.error(err)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    const upload = document.getElementById('upload') as HTMLInputElement
    upload.value = ''
    setTimeout(() => {
      upload.click()
    }, 0)
  }

  const openDialog = () => {
    setOpen(true)
  }

  const handleDeleteAvatar = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    openDialog()
  }

  const closeDialog = () => {
    setOpen(false)
  }

  const handleCancelDelete = () => {
    closeDialog()
  }

  const handleDelete = async () => {
    try {
      if (!user) {
        Helper.error()
        return
      }

      const { _id } = user

      if (!_id) {
        Helper.error()
        return
      }

      const status = await UserService.deleteAvatar(_id)

      if (status === 200) {
        const _user = await UserService.getUser(_id)

        if (_user) {
          setUser(_user)
          if (onChange) {
            onChange(_user)
          }
          closeDialog()
        } else {
          Helper.error()
        }
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  useEffect(() => {
    const language = UserService.getLanguage()
    commonStrings.setLanguage(language)

    const currentUser = UserService.getCurrentUser()
    if (currentUser) {
      setUser(avatarUser)
    } else {
      setError(true)
    }
  }, [avatarUser])

  return !error && loggedUser && user ? (
    <div className={className}>
      {loggedUser._id === user._id && !readonly ? (
        <div>
          <input id="upload" type="file" hidden onChange={handleChange} />
          {user.avatar ? (
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              badgeContent={(
                <Box borderRadius="50%" className="avatar-action-box" onClick={handleDeleteAvatar}>
                  <DeleteIcon className="avatar-action-icon" />
                </Box>
              )}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                badgeContent={(
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleUpload}>
                    <PhotoCameraIcon className="avatar-action-icon" />
                  </Box>
                )}
              >
                <MaterialAvatar src={movininHelper.joinURL(Env.CDN_USERS, user.avatar)} className="avatar" />
              </Badge>
            </Badge>
          ) : (
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <div>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleUpload}>
                    <PhotoCameraIcon className={user.language === 'ar' ? 'avatar-action-icon-rtl' : 'avatar-action-icon'} />
                  </Box>
                </div>
              )}
            >
              <MaterialAvatar className="avatar">
                <AccountCircle className="avatar" />
              </MaterialAvatar>
            </Badge>
          )}
        </div>
      ) : user.avatar ? (
        <MaterialAvatar src={movininHelper.joinURL(Env.CDN_USERS, user.avatar)} className={size ? `avatar-${size}` : 'avatar'} />
      ) : (
        <AccountCircle className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
      )}
      <Dialog disableEscapeKeyDown maxWidth="xs" open={open}>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{commonStrings.DELETE_AVATAR_CONFIRM}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCancelDelete} className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleDelete} className="btn-primary">
            {commonStrings.DELETE}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  ) : null
}

export default Avatar
