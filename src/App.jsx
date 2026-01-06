import React from 'react'
import './App.css'
import TopBar from './components/TopBar.jsx'
import User from './components/UserSection.jsx'
import { useState, useEffect } from 'react'

const BALANCE_KEY = "faucet_balances"

const App = () => {
  const [wallet, setWallet] = useState(null)
  const [balance, setBalance] = useState('0')
  
  const connectWallet = async ()=>{
    if (!window.ethereum) {
      alert("MetaMask not found")
      return
    }
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    const account = accounts[0]
    setWallet(account)
    
    // Load balance for this wallet
    const balances = JSON.parse(localStorage.getItem(BALANCE_KEY) || '{}')
    const savedBalance = balances[account] || '0'
    setBalance(savedBalance)
  }
  
  const increaseBalance = (amount) => {
    setBalance(prev => {
      const newBalance = (Number(prev) + amount).toString()
      
      // Save to localStorage
      const balances = JSON.parse(localStorage.getItem(BALANCE_KEY) || '{}')
      balances[wallet] = newBalance
      localStorage.setItem(BALANCE_KEY, JSON.stringify(balances))
      
      return newBalance
    })
  }
  
  return (
    <><div className='App'>
      <div className='topbar'>
      <TopBar wallet={wallet} connectWallet={connectWallet} balance={balance} />
      </div>
      <div className='main'>
      <User wallet={wallet} onClaim={increaseBalance}/>
        </div>
    </div></>
  )
}

export default App