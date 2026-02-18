import MappedChats from "./MappedChats";
import io from "socket.io-client";
import "./chats.css";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import BackButton from "../BackButton";
import pop from '../../../pop.mp3'
const notificationSound = new Audio(pop);


const Chats = (props) => {
  const [messages, setMessages] = useState([]);
  const [game, setGame] = useState("");
  const [socket, setSocket] = useState(null);
  const [joined, setJoined] = useState(false);
  const [chat_content, setchat_content] = useState("");
  const { match_id } = props.match.params;
  const { profile_id } = props.userReducer.user;
  



  const handleSocketConnect = useCallback(() => {
    if (!socket) {
      const skt = io();
      setSocket(skt);
    }
  }, [socket]);
  
  const handleSocketDisconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [socket]);
  
  const joinRoom = useCallback(() => {
    if (!joined && socket) {
      setJoined(true);
      socket.emit("join room", `${match_id}`);
    }
  }, [joined, socket, match_id]);
  
  const leaveRoom = useCallback(() => {
    if (joined && socket) {
      setJoined(false);
      socket.emit("leave room", `${match_id}`);
    }
  }, [socket, joined, match_id]);
  
  useEffect(() => {
    joinRoom();
    return () => {
      leaveRoom();
    };
  }, [joinRoom, leaveRoom]);
  
  useEffect(() => {
    handleSocketConnect();
    return () => {
      handleSocketDisconnect();
    };
  }, [handleSocketConnect, handleSocketDisconnect]);
  
  const handleIncomingMsg = useCallback(() => {
    axios.get(`/api/matchedchat/${match_id}`).then((res) => {
      setMessages(res.data);
    });
    notificationSound.play();
  }, [match_id]);

  const setupSubscriptions = useCallback(() => {
    if (socket) {
      socket.on("incoming msg", handleIncomingMsg);
    }
  }, [handleIncomingMsg, socket]);

  const unsubscribe = useCallback(() => {
    if (socket) {
      socket.off("incoming msg", handleIncomingMsg);
    }
  }, [handleIncomingMsg, socket]);

  useEffect(() => {
    setupSubscriptions();
    return () => {
      unsubscribe();
    };
  }, [setupSubscriptions, unsubscribe]);

  const getGame = () => {
    let gotGame = false;
    for (let i = 0; i < messages.length; i++) {
      if (gotGame === false) {
        if (messages[i].profile_id !== profile_id) {
          setGame(messages[i].game);
          return (gotGame = true);
        }
      }
    }
  };
  const handleClick = () => {
    socket.emit("new msg", match_id, { match_id, chat_content, profile_id });
    axios.get(`/api/matchedchat/${match_id}`).then((res) => {
      setMessages(res.data);
    });
    notificationSound.play();
    setchat_content("");
  };

    useEffect(() => {
      if (match_id) {
        axios.get(`/api/matchedchat/${match_id}`).then((res) => {
        setMessages(res.data);
        getGame();
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match_id]);

  let mappedChats = messages.map((message) => {
    return (
      <MappedChats key={message.chat_id} setGame={setGame} message={message} />
    );
  });

  return (
    <div id="chatsHolderHolder">
      <div id="chatsHolder">
        <div id='holder'>
          <div className="mappedChats">{mappedChats}</div>
          </div>
        <section id="chat_contentSection">
          <input
            value={chat_content}
            onChange={(e) => setchat_content(e.target.value)}
            className="chat_content"
            type="text"
            placeholder={`Ask about their favorite game... (hint: it's ${game})`}
          ></input>
          <div onClick={() => handleClick()} className="messageButton">
            Send
          </div>
        </section>
      </div>
      <BackButton />
    </div>
  );
};

const mapStateToProps = (reduxState) => {
  return reduxState;
};
export default connect(mapStateToProps)(Chats);