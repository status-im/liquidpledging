import React from 'react';
import EmbarkJS from 'Embark/EmbarkJS';
import LPVault from 'Embark/contracts/LPVault';
import LiquidPledgingMock from 'Embark/contracts/LiquidPledgingMock';
import web3 from "Embark/web3";
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import AddFunder from './components/AddFunder';
import CreateFunding from './components/CreateFunding';
import FunderProfilesTable from './components/FunderProfilesTable'
import PledgesTable from './components/PledgesTable'
import { initVaultAndLP, vaultPledgingNeedsInit, standardTokenApproval, getLpAllowance } from './utils/initialize'
import { getProfileEvents, formatFundProfileEvent } from './utils/events';
import { getAllPledges, appendToExistingPledges, transferBetweenPledges } from './utils/pledges';
import { FundingContext } from './context'
import { cancelProfile } from './utils/fundProfiles'
import SetMockedTime from './components/SetMockedTime'

const { getNetworkType } = web3.eth.net;

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  state = {
    lpAllowance: 0,
    fundProfiles: [],
    allPledges: [],
    needsInit: true
  };

  componentDidMount(){
    EmbarkJS.onReady(async (err) => {
      getNetworkType().then(async network => {
        const { environment } = EmbarkJS
        const isInitialized = await vaultPledgingNeedsInit()
        if (!!isInitialized) {
          console.log('mock_time:', await LiquidPledgingMock.mock_time.call())
          const lpAllowance = await getLpAllowance()
          const fundProfiles = await getProfileEvents()
          const allPledges = await getAllPledges()
          this.setState({
            network,
            environment,
            needsInit: false,
            lpAllowance,
            fundProfiles,
            allPledges
          })
        }
      });
    });
  }

  appendFundProfile = async event => {
    const formattedEvent = await formatFundProfileEvent(event)
    this.setState((state) => {
      const { fundProfiles } = state;
      return {
        ...state,
        fundProfiles: [ ...fundProfiles, formattedEvent ]
      }
    })
  }

  appendPledges = () => {
    const { allPledges } = this.state
    appendToExistingPledges(allPledges, this.setState)
  }

  transferPledgeAmounts = tx => {
    transferBetweenPledges(this.setState.bind(this), tx)
  }

  cancelFundProfile = id => {
    this.setState((state) => cancelProfile(state, id))
  }

  render() {
    const { needsInit, lpAllowance, fundProfiles, allPledges } = this.state;
    const { appendFundProfile, appendPledges, transferPledgeAmounts, cancelFundProfile } = this
    const fundingContext = { transferPledgeAmounts }
    return (
      <FundingContext.Provider value={fundingContext}>
        <div>
          {!!allPledges.length && <PledgesTable data={allPledges} transferPledgeAmounts={transferPledgeAmounts} fundProfiles={fundProfiles} />}
          {!!fundProfiles.length && <FunderProfilesTable data={fundProfiles} cancelFundProfile={cancelFundProfile}/>}
          <AddFunder appendFundProfile={appendFundProfile} />
          <Divider variant="middle" />
          <CreateFunding refreshTable={appendPledges} />
          {needsInit && <Button variant="outlined" color="secondary" onClick={initVaultAndLP}>
            Initialize Contracts
          </Button>}
          <Button variant="outlined" color="primary" onClick={standardTokenApproval}>
            GIVE VAULT TOKEN APPROVAL
          </Button>
          <SetMockedTime />
        </div>
      </FundingContext.Provider>
    )
  }
}

export default App;
