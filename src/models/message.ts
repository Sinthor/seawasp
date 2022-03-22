export type Message = {
  receiver: string;
  sender: string;
  payload: Object | string;
};

export type ConfirmMessage = Message & { received: boolean };
