import React, { Fragment, PureComponent } from 'react'
import MaterialTable from 'material-table'
import { toEther } from '../utils/conversions'
import { getTokenLabel } from '../utils/currencies'
import TransferDialog from './TransferDialog'
import WithdrawCard from './table/WithdrawCard'

const convertToHours = seconds => seconds / 60 / 60
const projectText = project => project === '0' ? 'N/A' : project
const pledgeStateMap = {
  0: 'Pledged',
  1: 'Paying',
  2: 'Paid'
}
const convertToDatetime = (field, fundProfiles) => {
  const { commitTime, id } = field
  const profile = fundProfiles[id - 1]
  //TODO fix - add commitTime from funder and delegates to get actual dateTime
  if (Number(commitTime) === 0) return 0
  const time = Number(commitTime) + Number(profile.commitTime)
  const date = new Date(time * 1000)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}
const formatField = (field, fundProfiles) => ({
  ...field,
  commitTime: convertToDatetime(field, fundProfiles),
  amount: toEther(field.amount),
  token: getTokenLabel(field.token),
  intendedProject: projectText(field.intendedProject),
  pledgeState: pledgeStateMap[field.pledgeState]
})
class PledgesTable extends PureComponent {
  state = {
    row: false,
  }

  handleClickOpen = row => {
    this.setState({ row });
  }

  handleClose = () => {
    this.setState({ row: false });
  }

  clearRowData = () => this.setState({ rowData: null })

  render() {
    const { data, transferPledgeAmounts, fundProfiles } = this.props
    const { row, rowData } = this.state
    return (
      <Fragment>
        <TransferDialog
          row={row}
          handleClose={this.handleClose}
          transferPledgeAmounts={transferPledgeAmounts}
        />
        <MaterialTable
          columns={[
            { title: 'Pledge Id', field: 'id', type: 'numeric' },
            { title: 'Owner', field: 'owner' },
            { title: 'Amount Funded', field: 'amount', type: 'numeric' },
            { title: 'Token', field: 'token' },
            { title: 'Commit Time', field: 'commitTime', type: 'numeric' },
            { title: 'Number of Delegates', field: 'nDelegates', type: 'numeric' },
            { title: 'Intended Project', field: 'intendedProject' },
            { title: 'Pledge State', field: 'pledgeState' },
          ]}
          data={data.map((f) => formatField(f, fundProfiles))}
          title="Pledges"
          actions={[
            {
              icon: 'compare_arrows',
              tooltip: 'Transfer funds',
              onClick: (event, rowData) => {
                this.handleClickOpen(rowData)
              }
            },
            {
              icon: 'attach_money',
              tooltip: 'Request Withdrawl',
              onClick: (event, rowData) => {
                console.log({rowData})
                this.setState({ rowData })
              }
            }
          ]}
        />
        {rowData && <WithdrawCard rowData={rowData} clearRowData={this.clearRowData} />}
      </Fragment>
    )
  }
}

export default PledgesTable
