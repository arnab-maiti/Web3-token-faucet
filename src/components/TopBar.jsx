import React, { useState } from 'react'
import './TopBar.css'

const TopBar = ({ wallet, connectWallet, balance }) => {
console.log("TopBar render:", {balance })
  return (
    <div className='topbar1'>
      <div className='title'>
        <h1>My Faucet</h1>
        <p>Web3 Test Token Distribution</p>
      </div>

      <div className='wallet'>
        {wallet ? (
          <div className='connected'>
            ✅ {wallet.slice(0,6)}...{wallet.slice(-4)}
          </div>
        ) : (
          <button onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className='balance'>Balance: {balance} TEST</div>
      </div>
    </div>
  )
}

export default TopBar
