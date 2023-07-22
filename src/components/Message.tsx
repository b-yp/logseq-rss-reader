import React, { useEffect } from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

interface MessageProps {
  open: boolean;
  type: AlertColor;
  value: string;
  autoHideDuration?: number | null;
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({
  type,
  value,
  open,
  autoHideDuration = 3000,
  onClose,
}) => {
  useEffect(() => () => onClose(), []);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
    >
      <Alert onClose={onClose} severity={type} sx={{ width: "100%" }}>
        {value}
      </Alert>
    </Snackbar>
  );
};

export default Message;
