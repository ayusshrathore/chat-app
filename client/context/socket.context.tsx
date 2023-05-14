"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";
import EVENTS from "@/config/events";

type Message = {
	message: string;
	username: string;
	time: string;
};

interface SocketContext {
	socket: Socket;
	username?: string;
	setUsername: React.Dispatch<React.SetStateAction<string>>;
	roomId?: string;
	rooms: object;
	messages?: Message[];
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface Props {
	children: React.ReactNode;
}

export const socket = io(SOCKET_URL);
export const SocketContext = createContext<SocketContext>({
	socket,
	setUsername: () => {},
	rooms: {},
	messages: [],
	setMessages: () => {},
});

export const SocketProvider = ({ children }: Props) => {
	const [username, setUsername] = useState("");
	const [roomId, setRoomId] = useState("");
	const [rooms, setRooms] = useState({});
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		window.onfocus = () => {
			document.title = "Chat App";
		};
	}, []);

	socket.on(EVENTS.SERVER.ROOMS, (value: string) => {
		setRooms(value);
	});

	socket.on(EVENTS.SERVER.JOINED_ROOM, (value: string) => {
		setRoomId(value);
		setMessages([]);
	});

	useEffect(() => {
		socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, username, time }) => {
			if (!document.hasFocus()) {
				document.title = "New message...";
			}

			setMessages((messages) => [
				...messages,
				{ message, username, time },
			]);
		});
	}, [socket]);

	return (
		<SocketContext.Provider
			value={{
				socket,
				username,
				setUsername,
				rooms,
				roomId,
				messages,
				setMessages,
			}}>
			{children}
		</SocketContext.Provider>
	);
};

export default SocketProvider;

export const useSocket = () => {
	return useContext(SocketContext);
};
