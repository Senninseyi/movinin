import React, { useState, useEffect } from 'react'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import { TextFieldVariants } from '@mui/material'
import Env from '../config/env.config'
import * as AgencyService from '../services/AgencyService'
import * as Helper from '../common/Helper'
import MultipleSelect from './MultipleSelect'

function AgencySelectList({
  value,
  multiple,
  label,
  required,
  readOnly,
  variant,
  onChange
}: {
  value?: movininTypes.Option | movininTypes.Option[]
  multiple?: boolean,
  label?: string,
  required?: boolean,
  readOnly?: boolean,
  variant?: TextFieldVariants,
  onChange?: (values: movininTypes.Option[]) => void
}) {
  const [init, setInit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<movininTypes.Option[]>([])
  const [fetch, setFetch] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<movininTypes.Option[]>([])

  useEffect(() => {
    const _value = multiple ? value : [value]
    if (value && !movininHelper.arrayEqual(selectedOptions, _value)) {
      setSelectedOptions(_value as movininTypes.Option[])
    }
  }, [value, multiple, selectedOptions])

  const getAgencies = (agencies: movininTypes.User[]): movininTypes.Option[] =>
    agencies.map((agency) => {
      const { _id, fullName, avatar } = agency
      return { _id: _id as string, name: fullName, image: avatar }
    })

  const _fetch = async (_page: number, _keyword: string, onFetch?: (data: { rows: any[], rowCount: number }) => void) => {
    try {
      setLoading(true)
      const data = await AgencyService.getAgencies(_keyword, _page, Env.PAGE_SIZE)
      const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
      if (!_data) {
        Helper.error()
        return
      }
      const totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0
      const _rows = _page === 1 ? getAgencies(_data.resultData) : [...rows, ...getAgencies(_data.resultData)]

      setRows(_rows)
      setFetch(_data.resultData.length > 0)

      if (onFetch) {
        onFetch({ rows: _data.resultData, rowCount: totalRecords })
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
      readOnly={readOnly}
      multiple={multiple}
      type={movininTypes.RecordType.Agency}
      variant={variant || 'standard'}
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

export default AgencySelectList
