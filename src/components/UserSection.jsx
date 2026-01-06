import React, { useState, useEffect } from "react";
import "./UserSection.css";
import { FAUCET_ADDRESS } from "../utils/constants";
import { FAUCET_ABI } from "../utils/faucetAbi";
import { ethers } from "ethers";

const STORAGE_KEY = "faucet_cooldown_end";
const TASKS_KEY = "faucet_tasks_per_wallet";

const COOLDOWN_SECONDS = 5 * 60 * 60; // 5 hours

const UserSection = ({ wallet, onClaim }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  const [cooldown, setCooldown] = useState(0);

  const [tasks, setTasks] = useState({
    twitter: false,
    discord: false,
    quiz: false,
  });

  const [quizAnswer, setQuizAnswer] = useState("");

  /* ---------------- LOAD TASKS PER WALLET ---------------- */
  useEffect(() => {
    if (!wallet) return;

    const allTasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "{}");
    setTasks(
      allTasks[wallet] || {
        twitter: false,
        discord: false,
        quiz: false,
      }
    );
  }, [wallet]);

  /* ---------------- SAVE TASKS ---------------- */
  useEffect(() => {
    if (!wallet) return;

    const allTasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "{}");
    allTasks[wallet] = tasks;
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
  }, [tasks, wallet]);

  /* ---------------- LOAD COOLDOWN FROM STORAGE ---------------- */
  useEffect(() => {
    if (!wallet) return;

    const endTime = localStorage.getItem(`${STORAGE_KEY}_${wallet}`);
    if (!endTime) return;

    const remaining = Math.floor((endTime - Date.now()) / 1000);
    if (remaining > 0) {
      setCooldown(remaining);
    }
  }, [wallet]);

  /* ---------------- COUNTDOWN TIMER ---------------- */
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  /* ---------------- CLAIM ---------------- */
  const handleClaim = async () => {
    if (!wallet) return alert("Connect wallet first");

    try {
      setIsClaiming(true);
      setTxStatus("Waiting for wallet confirmation...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const faucet = new ethers.Contract(
        FAUCET_ADDRESS,
        FAUCET_ABI,
        signer
      );

      const tx = await faucet.claim();
      setTxHash(tx.hash);
      setTxStatus("Transaction sent. Waiting for confirmation...");

      await tx.wait();

      setTxStatus("Claim successful");

      const endTime = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem(`${STORAGE_KEY}_${wallet}`, endTime);
      setCooldown(COOLDOWN_SECONDS);

      onClaim(15);
      alert("🎉 Claimed 15 TEST Tokens");
    } catch (err) {
      console.error(err);

      if (err.code === 4001) {
        setTxStatus("Transaction rejected");
      } else if (err.reason) {
        setTxStatus(err.reason);
      } else {
        setTxStatus("Transaction failed");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  /* ---------------- QUIZ ---------------- */
  const handleQuizSubmit = () => {
    if (quizAnswer === "blockchain") {
      setTasks({ ...tasks, quiz: true });
      alert("Quiz passed");
    } else {
      alert("Wrong answer");
    }
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  const allTasksDone = Object.values(tasks).every(Boolean);

  /* ---------------- UI ---------------- */
  return (
    <div className="user-section">
      {/* LEFT */}
      <div className="card">
        <div className="reputation">⭐</div>
        <h3>Proof of Action</h3>

        {wallet && (
          <>
            <div className="task">
              <button
                disabled={tasks.twitter}
                onClick={() => {
                  window.open("https://twitter.com/ArnabMaiti92330", "_blank");
                  setTasks({ ...tasks, twitter: true });
                }}
              >
                {tasks.twitter ? "Followed on X" : "Follow on X"}
              </button>
            </div>

            <div className="task">
              <button
                disabled={tasks.discord}
                onClick={() => {
                  window.open("https://discord.gg/sgnNAGxnH", "_blank");
                  setTasks({ ...tasks, discord: true });
                }}
              >
                {tasks.discord ? "Joined Discord" : "Join Discord"}
              </button>
            </div>

            <div className="task quiz">
              <p><b>Quiz:</b> What secures a blockchain?</p>

              <select
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                disabled={tasks.quiz}
              >
                <option value="">Select answer</option>
                <option value="password">Password</option>
                <option value="blockchain">Cryptography</option>
                <option value="server">Central server</option>
              </select>

              {!tasks.quiz && (
                <button onClick={handleQuizSubmit}>Submit Quiz</button>
              )}

              {tasks.quiz && <p>Quiz Completed</p>}
            </div>
          </>
        )}
      </div>

      {/* RIGHT */}
      <div className="card center">
        {cooldown > 0 ? (
          <p className="cooldown-text">
            ⏳ Next claim in: {formatTime(cooldown)}
          </p>
        ) : (
          <button
            className="claim-btn"
            disabled={isClaiming || !wallet || !allTasksDone}
            onClick={handleClaim}
          >
            {isClaiming ? "Claiming..." : "Claim 15 TEST Tokens"}
          </button>
        )}

        {txStatus && (
          <div className="tx-status">
            <p>{txStatus}</p>
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Etherscan
              </a>
            )}
          </div>
        )}

        {!wallet && <p>Connect wallet first</p>}
        {wallet && !allTasksDone && <p>Complete all actions to claim</p>}
        {wallet && cooldown === 0 && allTasksDone && <p>Ready to claim</p>}

        <small>X + Discord + Quiz = Anti-Bot Layer</small>
      </div>
    </div>
  );
};

export default UserSection;
