import React, { useState, useEffect } from 'react'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import { TextFieldVariants } from '@mui/material'
import Env from '../config/env.config'
import * as LocationService from '../services/LocationService'
import * as Helper from '../common/Helper'
import MultipleSelect from './MultipleSelect'

function LocationSelectList({
    value,
    multiple,
    label,
    required,
    variant,
    readOnly,
    hidePopupIcon,
    customOpen,
    onChange
  }: {
    value?: movininTypes.Location | movininTypes.Location[]
    multiple?: boolean
    label?: string
    required?: boolean
    variant?: TextFieldVariants
    readOnly?: boolean
    hidePopupIcon?: boolean
    customOpen?: boolean
    onChange?: (values: movininTypes.Option[]) => void
  }) {
  const [init, setInit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<movininTypes.Location[]>([])
  const [fetch, setFetch] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<movininTypes.Location[]>([])

  useEffect(() => {
    const _value = multiple ? value as movininTypes.Location[] : [value as movininTypes.Location]
    if (value && !movininHelper.arrayEqual(selectedOptions, _value)) {
      setSelectedOptions(_value)
    }
  }, [value, multiple, selectedOptions])

  const _fetch = async (_page: number, _keyword: string, onFetch?: movininTypes.DataEvent<movininTypes.Location>) => {
    try {
      if (fetch || _page === 1) {
        setLoading(true)

        const data = await LocationService.getLocations(_keyword, _page, Env.PAGE_SIZE)
        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          return
        }
        const totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0
        const _rows = _page === 1 ? _data.resultData : [...rows, ..._data.resultData]

        setRows(_rows)
        setFetch(_data.resultData.length > 0)

        if (onFetch) {
          onFetch({ rows: _data.resultData, rowCount: totalRecords })
        }
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (values: movininTypes.Option[]) => {
    if (onChange) {
      onChange(values)
    }
  }

  return (
    <MultipleSelect
      loading={loading}
      label={label || ''}
      callbackFromMultipleSelect={handleChange}
      options={rows}
      selectedOptions={selectedOptions}
      required={required || false}
      multiple={multiple}
      type={movininTypes.RecordType.Location}
      variant={variant || 'standard'}
      hidePopupIcon={hidePopupIcon}
      customOpen={customOpen}
      readOnly={readOnly}
      ListboxProps={{
        onScroll: (event) => {
          const listboxNode = event.currentTarget
          if (fetch && !loading && listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - Env.PAGE_OFFSET) {
            const p = page + 1
            setPage(p)
            _fetch(p, keyword)
          }
        },
      }}
      onFocus={() => {
        if (!init) {
          const p = 1
          setRows([])
          setPage(p)
          _fetch(p, keyword, () => {
            setInit(true)
          })
        }
      }}
      onInputChange={(event) => {
        const _value = (event && event.target && 'value' in event.target && event.target.value as string) || ''

        // if (event.target.type === 'text' && value !== keyword) {
        if (_value !== keyword) {
          setRows([])
          setPage(1)
          setKeyword(_value)
          _fetch(1, _value)
        }
      }}
      onClear={() => {
        setRows([])
        setPage(1)
        setKeyword('')
        setFetch(true)
        _fetch(1, '')
      }}
    />
  )
}

export default LocationSelectList
