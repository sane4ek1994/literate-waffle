import { TableCell, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppSelector } from '../../../../hooks'
import { useGetPopoverDataQuery } from '../../../../store/authApiSlice'
import { useLoadReportsQuery } from '../../../../store/reportsByOGApiSlice'
import CustomTable from '../../../custom-desctop-table'
import { Column, ReportsByOGContent } from '../../../models'

type Filter = {
  attribute: string
  filter: string
  type: string
}

type QueryParameters = {
  page: number
  sortBy: {
    direction: string
    field: string
  }
  filterBy: Filter[]
  count: number
}
export default function ReportsByOGSection() {
  const navigate = useNavigate()
  const data = useAppSelector((state) => state.biolap.reportsByOG.settings.columns)
  const [columns, setColumns] = useState<(Column[] & { disabled?: boolean }[]) | []>([])
  const [queryParameters, setQueryParameters] = useState<QueryParameters>({
    page: 0,
    sortBy: { direction: 'DESC', field: 'reportName' },
    filterBy: [],
    count: 20
  })

  const { data: sortData } = useGetPopoverDataQuery('REPORTS_BY_OG')

  const skipLoadReports = !sortData || sortData.length === 0 || !sortData[0].sort
  const { data: reportsListByOG } = useLoadReportsQuery(queryParameters, {
    skip: skipLoadReports
  })
  const getWord = (arg: string) => {
    console.log(arg)
  }

  useEffect(() => {
    console.log('DESC ASC EFFECT')
    if (sortData && sortData.length > 0 && sortData[0].sort) {
      setQueryParameters((prev) => ({
        ...prev,
        sortBy: {
          field: sortData[0].sort.field || 'reportName',
          direction: sortData[0].sort.direction || 'DESC'
        }
      }))
    }
  }, [sortData])

  useEffect(() => {
    if (!data.length) return
    let copy = JSON.parse(JSON.stringify(data))

    setColumns(copy)
  }, [data, setColumns])

  const cellContent = (row: ReportsByOGContent) => (
    <>
      {columns.map((item, i) => {
        if (!item.disabled) {
          let title = row[item.name as keyof ReportsByOGContent]
          if (i === 0) {
            return (
              <TableCell key={`${i}${row.id}`}>
                <Typography
                  fontSize={13}
                  sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => navigate(`/passport/${row.reportId}`)}
                >
                  {title}
                </Typography>
              </TableCell>
            )
          }
          return (
            <TableCell key={`${i}${row.id}`}>
              <Typography fontSize={13}>{title}</Typography>
            </TableCell>
          )
        }
      })}
    </>
  )

  return (
    columns && (
      <CustomTable
        columns={columns}
        getWord={getWord}
        rows={reportsListByOG?.content}
        cellContent={cellContent}
        hover
      />
    )
  )
}
