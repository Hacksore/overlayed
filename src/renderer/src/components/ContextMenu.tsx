import { FC } from "react";
import { Menu, MenuItem, Typography } from "@mui/material";
import { RootState } from "../store";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { appSlice } from "../reducers/rootReducer";
import { darken, styled } from "@mui/system";
import socketSerivce from "../services/socketService";
import { CustomEvents } from "../../../common/constants";
import { RPCCommands } from "../../../common/ipc/constants";

const { setContextMenu } = appSlice.actions;

const PREFIX = "ContextMenu";
const classes = {
  list: `${PREFIX}-list`,
  paper: `${PREFIX}-paper`,
};

export const Root = styled("div")(() => ({
  [`& .${classes.list}`]: {
    padding: 0,
    width: 120,
    "& li": {
      padding: "0 12px 0 12px",
      minHeight: 30,
    },
  },
  [`& .${classes.paper}`]: {
    padding: 0,
  },
}));

export const ContextMenu: FC = () => {
  const contextMenu = useAppSelector((state: RootState) => state.root.contextMenu);
  const users = useAppSelector((state: RootState) => state.root.users);
  const dispatch = useAppDispatch();
  const handleClose = () => {
    dispatch(
      setContextMenu({
        open: false,
        x: 0,
        y: 0,
      })
    );
  };

  const userInfo = users.find(item => item.id === contextMenu.id);
  const muted = userInfo?.muted;

  return (
    <Root>
      <Menu
        open={contextMenu.open}
        onClose={handleClose}
        classes={{ list: classes.list, paper: classes.paper }}
        anchorReference="anchorPosition"
        disablePortal={true}
        anchorPosition={contextMenu !== null ? { left: contextMenu.x, top: contextMenu.y } : undefined}
      >
        <Typography
          sx={{
            padding: 1,
            maxWidth: 150,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            backgroundColor: theme => darken(theme.palette.background.default, 0.2),
          }}
          onClick={handleClose}
        >
          {userInfo?.username}
        </Typography>
        <MenuItem
          onClick={() => {
            socketSerivce.send({
              event: CustomEvents.DISCORD_MESSAGE,
              data: {
                cmd: RPCCommands.SET_USER_VOICE_SETTINGS,
                args: {
                  user_id: userInfo?.id,
                  mute: !muted,
                },
              },
            });
            handleClose();
          }}
        >
          {muted ? "Unmute" : "Mute"}
        </MenuItem>
      </Menu>
    </Root>
  );
};
