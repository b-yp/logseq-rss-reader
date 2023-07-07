import React, { useEffect } from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

interface MessageProps {
  open: boolean;
  type: AlertColor;
  value: string;
}

const Message: React.FC<MessageProps> = ({ type, value, open }) => {
  const [showMessage, setShowMessage] = React.useState(false);

  useEffect(() => {
    if (open) {
      setShowMessage(open);
    }
  }, [open]);

  return (
    <Snackbar
      open={showMessage}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={6000}
      onClose={() => setShowMessage(false)}
    >
      <Alert
        onClose={() => setShowMessage(false)}
        severity={type}
        sx={{ width: "100%" }}
      >
        {value}
      </Alert>
    </Snackbar>
  );
};

export default Message;
