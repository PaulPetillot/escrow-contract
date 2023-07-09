import { ethers } from 'ethers';
import axios from 'axios';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import escrowContract from './artifacts/contracts/Escrow.sol/Escrow'

const provider = new ethers.providers.Web3Provider(window.ethereum);
const API = "http://localhost:4000";

export async function approve(contract, signer) {
  const approveTxn = await contract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [signer, setSigner] = useState();
  const [arbiter, setArbiter] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [eth, setEth] = useState("");

  async function newContract() {
    const value = ethers.utils.parseUnits(eth, "ether")
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    await axios.post(`${API}/contracts`, { address: escrowContract.address }, { headers: { 'Content-Type': 'application/json' } });

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      isApproved: false,
      handleApprove: async () => {
        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  useEffect(() => {
    async function getAccounts() {
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, []);

  useEffect(() => {
    const getValues = async () => {
      const contractAddresses = await axios.get(`${API}/`);

      contractAddresses.data.map(async ({ address }) => {
        const contract = new ethers.Contract(address, escrowContract.abi, provider);
        const arbiter = await contract.arbiter();
        const beneficiary = await contract.beneficiary();
        const balance = await provider.getBalance(address);
        const balanceInEther = ethers.utils.formatEther(balance);
        const isApproved = await contract.isApproved();

        const escrow = {
          address,
          arbiter,
          beneficiary,
          value: balanceInEther.toString(),
          isApproved,
          handleApprove: async () => {
            await approve(contract, signer);
          }
        };

        setEscrows((prevEscrows) => [...prevEscrows, escrow]);
      });
    }

    if (signer) {
      getValues();
    }
  }, [signer]);

  useEffect(() => {
    if (signer && escrows.length > 0) {
      escrows.forEach(async (escrow) => {
        const contract = new ethers.Contract(escrow.address, escrowContract.abi, signer);

        contract.on('Approved', async () => {
          setEscrows((prevEscrows) => prevEscrows.map((esc) =>
            esc.address === escrow.address ? { ...esc, isApproved: true } : esc
          ));
        });
      });
    }

    return () => {
      if (signer && escrows.length > 0) {
        escrows.forEach((escrow) => {
          const contract = new ethers.Contract(escrow.address, escrowContract.abi, signer);
          contract.removeAllListeners('Approved');
        });
      }
    }
  }, [signer, escrows]);

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" value={arbiter} onChange={(e) => setArbiter(e.target.value)} />
        </label>

        <label>
          Beneficiary Address
          <input type="text" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} />
        </label>

        <label>
          Deposit Amount (in Eth)
          <input type="text" value={eth} onChange={(e) => setEth(e.target.value)} />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();
            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow, i) => {
            return <Escrow key={i} {...escrow} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
