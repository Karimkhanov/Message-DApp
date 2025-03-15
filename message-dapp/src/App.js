import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

// Адрес вашего развернутого смарт-контракта (замените на актуальный, он должен начинаться с 0x и содержать 42 символа)
const contractAddress = "0x227b0137cb060e55d0793f39bbebd5da0926200f";

// ABI – описание функций и конструктора контракта
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getMessages",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct AuthMessageContract.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_content",
        type: "string",
      },
    ],
    name: "storeMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

function App() {
  // Состояния для хранения текущего аккаунта, введённого сообщения, списка сообщений и экземпляра контракта
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contract, setContract] = useState(null);

  // Функция для подключения MetaMask
  const connectWallet = async () => {
    // Проверяем, установлен ли MetaMask (window.ethereum должен быть доступен)
    if (window.ethereum) {
      // Создаем провайдера, используя MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Запрашиваем разрешение на доступ к аккаунтам MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      // Получаем подписанта (signer) для выполнения транзакций
      const signer = provider.getSigner();
      // Получаем адрес подключенного аккаунта
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      // Создаем экземпляр контракта с использованием адреса, ABI и подписанта
      const contractInstance = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );
      setContract(contractInstance);
      // Загружаем сообщения для подключенного аккаунта
      loadMessages(contractInstance, signer);
    } else {
      alert("Пожалуйста, установите MetaMask!");
    }
  };

  // Функция для отправки нового сообщения в смарт-контракт
  const sendMessage = async () => {
    if (!contract) return;
    try {
      // Вызываем функцию storeMessage смарт-контракта, передавая введенное сообщение
      const tx = await contract.storeMessage(message);
      // Ждем подтверждения транзакции
      await tx.wait();
      // После подтверждения обновляем список сообщений
      loadMessages(contract);
      // Очищаем поле ввода
      setMessage("");
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  };

  // Функция для загрузки сообщений для текущего пользователя
  const loadMessages = async (contractInstance, signerParam) => {
    try {
      // Если не передан signer, используем подписанта, связанного с контрактом
      const signer = signerParam || contractInstance.signer;
      // Получаем адрес пользователя
      const userAddress = await signer.getAddress();
      // Вызываем функцию getMessages для получения списка сообщений
      const msgs = await contractInstance.getMessages(userAddress);
      // Сохраняем полученные сообщения в состояние
      setMessages(msgs);
    } catch (error) {
      console.error("Ошибка при загрузке сообщений:", error);
    }
  };

  // Разметка (JSX) приложения
  return (
    <div className="App">
      {/* Заголовок приложения */}
      <h2 className="header">Message DApp</h2>
      {/* Кнопка для подключения MetaMask */}
      <button className="button" onClick={connectWallet}>
        Connect MetaMask
      </button>
      {/* Если подключен аккаунт, отображаем его адрес */}
      {account && <p>Connected account: {account}</p>}
      <div style={{ marginTop: "20px" }}>
        {/* Поле ввода для нового сообщения */}
        <input
          type="text"
          placeholder="Enter a new message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input"
        />
        {/* Кнопка для отправки сообщения */}
        <button className="button" onClick={sendMessage}>
          Send Message
        </button>
      </div>
      {/* Заголовок для списка сообщений */}
      <h3 style={{ marginTop: "20px" }}>Message History:</h3>
      <ul className="messageList">
        {/* Перебираем список сообщений и отображаем каждое сообщение */}
        {messages.map((msg, index) => (
          <li key={index} className="messageItem">
            {new Date(msg.timestamp * 1000).toLocaleString()}: {msg.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
