/*
 Copyright (C) 2016, 2020, 2022, 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under
 the terms of the GNU General Public License as published by the Free Software
 Foundation, either version 3 of the License, or (at your option) any later
 version.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with
 this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * This is a namespace for things used by mail functionality.
 */
declare namespace web3n.asmail {
	
	interface Service {
		
		/**
		 * This returns a promise resolvable to id (address) of a current signed
		 * user.
		 */
		getUserId(): Promise<string>;

		inbox: InboxService;
		
		delivery: DeliveryService;

	}

	interface DeliveryProgress {
		notConnected?: true;
		allDone?: 'all-ok' | 'with-errors';
		msgSize: number;
		localMeta?: any;
		recipients: {
			[address: string]: {
				done: boolean;
				idOnDelivery?: string;
				deliveryTS?: number;
				err?: DeliveryException | RuntimeException | Error;
				bytesSent: number;
				// XXX
				awaitingRetry?: boolean;
				failedAttempts?: {
					attemptTS: number;
					err: any;
				}[];
			}
		};
	}

	type DeliveryException = ASMailSendException | ServLocException | ASMailSendException;

	interface DeliveryOptions {
		/**
		 * sendImmediately flag forces immediate delivery with true value.
		 */
		sendImmediately?: boolean;
		/**
		 * localMeta is an optional data field that is attached to this message's
		 * delivery progress. This data never leaves local machine and is
		 * associated with particular delivery.
		 */
		localMeta?: any;

		// XXX
		
		retryRecipient?: {
			numOfAttempts: number;
			// XXX default client says "ASAP" => core applies own sane default
			timeBetweenAttempts?: number;
		};
	}

	interface DeliveryService {
		
		/**
		 * This returns a promise, resolvable to an allowable total size of a
		 * message
		 * @param toAddress
		 */
		preFlight(toAddress: string): Promise<number>;

		/**
		 * This method adds a message for delivery, returning a promise,
		 * resolvable when core accepts message for delivery.
		 * If message requires small amount of network connection, it is set to be
		 * sent immediately. Else, when message is big, or is sent to too many
		 * recipients, it is added to an internal queue for orderly processing.
		 * @param recipients is an array of addresses, where this message should
		 * be sent.
		 * @param msg is a message to be sent
		 * @param id is an id, associated with a given message, for referencing
		 * it in other delivery methods. This id should not be confused with ids,
		 * generated by message accepting servers, associated with each message
		 * delivery.
		 * @param @param opts is an optional object with delivery options.
		 * Default value has no defined fields.
		 */
		addMsg(recipients: string[], msg: OutgoingMessage, id: string,
			opts?: DeliveryOptions): Promise<void>;

		/**
		 * This returns a promise, resolvable to an array of objects, each
		 * carrying message id, used when message was added, and a respective
		 * delivery progress info. This shows all messages currently in a delivery
		 * sub-system, even those with completed delivery process.
		 */
		listMsgs(): Promise<{ id: string; info: DeliveryProgress; }[]>;
		
		/**
		 * This returns a promise, resolvable to current delivery info.
		 * If given id is not known, promise resolves to undefined.
		 * @param id of a message, used when the message was added
		 */
		currentState(id: string): Promise<DeliveryProgress|undefined>;

		/**
		 * This function attaches listeners to observe delivery process of a
		 * particular message. This call returns a detaching function.
		 * Due to immediate subscription, given callbacks become hot.
		 * @param id of a message, used when the message was added
		 * @param observer is an object with at least one of three methods: next,
		 * completed, and error.
		 * Method next it is an on-event callback, called every time there is
		 * an event, which can be zero or more times. This is never called after
		 * either completion, error, or detachment.
		 * Method complete is a callback that is called only once, when event
		 * source says that there will be no more events, i.e. when a normal
		 * completion occurs. Note that this function is not called when detacher
		 * is triggered.
		 * Method error is a callback that is called on error, either coming
		 * from event source, or if onNext throws something, although it must
		 * handle its own stuff.
		 */
		observeDelivery(id: string, observer: Observer<DeliveryProgress>):
			() => void;
		
		/**
		 * This returns a promise, resolvable when the message is removed from a
		 * delivery sub-system.
		 * @param id of a message, used when the message was added
		 * @param cancelSending is a flag, which true value forces delivery
		 * cancelation of a message. With a default false value, message is not
		 * removed, if its delivery process hasn't completed, yet.
		 */
		rmMsg(id: string, cancelSending?: boolean): Promise<void>;

		/**
		 * This function attaches listeners to observe all delivery processes.
		 * This call returns a detaching function.
		 * Due to immediate subscription, given callbacks become hot.
		 * @param observer is an object with at least one of three methods: next,
		 * completed, and error.
		 * Method next it is an on-event callback, called every time there is
		 * an event, which can be zero or more times. This is never called after
		 * either completion, error, or detachment.
		 * Method complete is a callback that is called only once, when event
		 * source says that there will be no more events, i.e. when a normal
		 * completion occurs. Note that this function is not called when detacher
		 * is triggered.
		 * Method error is a callback that is called on error, either coming
		 * from event source, or if onNext throws something, although it must
		 * handle its own stuff.
		 */
		observeAllDeliveries(observer: Observer<{
			id: string; progress: DeliveryProgress; }>): () => void;

	}

	interface InboxService {
		
		/**
		 * This returns a promise, resolvable to info objects for messages that
		 * are present on a server, timestamped starting with a given time, if it
		 * is given.
		 * @param fromTS an optional timestamp to limit message listing only to
		 * those messages with the same or more recent timestamps.
		 */
		listMsgs(fromTS?: number): Promise<MsgInfo[]>;
		
		/**
		 * This returns a promise, resolvable when a given message has been
		 * removed on the server.
		 * @param msgId
		 */
		removeMsg(msgId: string): Promise<void>;
		
		/**
		 * This returns a promise, resolvable to a message, present on a server.
		 * @param
		 */
		getMsg(msgId: string): Promise<IncomingMessage>;

		/**
		 * This function attaches listeners for a given event, returning a
		 * detaching function.
		 * Due to immediate subscription, given callbacks become hot.
		 * @param event
		 * @param observer is an object with at least one of three methods: next,
		 * completed, and error.
		 * Method next it is an on-event callback, called every time there is
		 * an event, which can be zero or more times. This is never called after
		 * either completion, error, or detachment.
		 * Method complete is a callback that is called only once, when event
		 * source says that there will be no more events, i.e. when a normal
		 * completion occurs. Note that this function is not called when detacher
		 * is triggered.
		 * Method error is a callback that is called on error, either coming
		 * from event source, or if next throws something, although it must
		 * handle its own stuff.
		 */
		subscribe(event: InboxEventType, observer: Observer<IncomingMessage>):
			() => void;
		
	}

	type InboxEventType = 'message';

	interface MsgStruct {
		/**
		 * Message type can be
		 * - "mail" for messages that better be viewed in mail styly UI,
		 * - "chat" for messages that better be viewed in chat style UI,
		 * - "app:<app-domain>" for application messages, for example, messages
		 *   with type "app:app.example.com" is for app.example.com app,
		 * - "webrtc-signaling" for WebRTC off band signalling.
		 */
		msgType: string;
		subject?: string;
		plainTxtBody?: string;
		htmlTxtBody?: string;
		jsonBody?: any;
		carbonCopy?: string[];
		recipients?: string[];
	}

	interface MsgInfo {
		msgId: string;
		msgType: string;
		deliveryTS: number;
	}

	interface IncomingMessage extends MsgInfo, MsgStruct {
		sender: string;
		establishedSenderKeyChain: boolean;
		attachments?: files.ReadonlyFS;
		// XXX info if not from the first attempt
	}

	interface OutgoingMessage extends MsgStruct {
		msgId?: string;
		attachments?: AttachmentsContainer;
	}

	/**
	 * This container is for entities that will be present in attachments
	 * fs/folder of recipient's incoming message.
	 */
	interface AttachmentsContainer {
		files?: {
			[name: string]: files.File;
		};
		folders?: {
			[name: string]: files.FS;
		};
	}

	interface InboxException extends RuntimeException {
		type: "inbox";
		msgId: string;
		msgNotFound?: true;
		objNotFound?: true;
		objId?: string;
		msgIsBroken?: true;
	}

	interface ServLocException extends RuntimeException {
		type: 'service-locating';
		address: string;

		/**
		 * domainNotFound flag indicates that domain in the address doesn't exist.
		 */
		domainNotFound?: true;

		/**
		 * noServiceRecord flag indicates that 3NWeb services are not set at
		 * domain in the address.
		 */
		noServiceRecord?: true;
	}

	interface ASMailSendException extends RuntimeException {
		type: 'asmail-delivery';
		address?: string;
		
		// errors that are due to remote side,
		// these will be placed into ProgressDelivery object
		unknownRecipient?: true;
		senderNotAllowed?: true;
		inboxIsFull?: true;
		badRedirect?: true;
		authFailedOnDelivery?: true;
		msgTooBig?: true;
		allowedSize?: number;
		recipientHasNoPubKey?: true;
		recipientPubKeyFailsValidation?: true;
		msgNotFound?: true;
		
		// errors that are due to this side
		msgCancelled?: true;
	}

}
