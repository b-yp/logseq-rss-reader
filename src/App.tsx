import React, { useEffect, useRef, useState } from "react";
import Parser from "rss-parser";
import { getLinkPreview } from "link-preview-js";

import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import Zoom from "@mui/material/Zoom";
import AddIcon from "@mui/icons-material/Add";

import LoadingButton from "@mui/lab/LoadingButton";

import Message from "./components/Message";
import {
  extractBaseURL,
  extractURL,
  formatObject,
  parseObjectValue,
  useAppVisible,
} from "./utils";
import { RssOption } from "./types";

import "./index.css";
import { PageEntity } from "@logseq/libs/dist/LSPlugin";

const rssList = [
  "http://www.ruanyifeng.com/blog/atom.xml",
  "https://www.reddit.com/.rss",
  "https://sspai.com/feed",
  "http://feed.appinn.com/",
  "https://xinquji.com/rss",
  "https://www.woshipm.com/feed",
  "https://www.zhangxinxu.com/wordpress/feed/",
  "https://coolshell.cn/feed",
  "https://liriansu.com/index.xml",
  "https://chensy.cn/post/index.xml",
];

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const theme = useTheme();
  const parser = new Parser();
  const [rssOptions, setRssOptions] = useState<RssOption[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currntRssUrl, setCurrntRssUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageInfo, setMessageInfo] = useState<{
    open: boolean;
    type: "success" | "info" | "warning" | "error";
    value: string;
  }>({
    open: false,
    type: "success",
    value: "",
  });
  const [configPage, setConfigPage] = useState<PageEntity | null>(null);
  const [feedList, setFeedList] = useState<Parser.Item[]>([]);

  const init = async () => {
    let rssConfigPage;
    rssConfigPage = await logseq.Editor.getPage(".rss-config");
    if (!rssConfigPage) {
      rssConfigPage = await logseq.Editor.createPage(
        ".rss-config",
        {},
        { createFirstBlock: false }
      );
    }
    if (!rssConfigPage?.uuid) return;
    setConfigPage(rssConfigPage);
    const tree = await logseq.Editor.getPageBlocksTree(rssConfigPage?.uuid);

    const options = tree
      .filter((i) => !!i.content)
      .map((i) => ({
        ...parseObjectValue(i.properties),
        feedUrl: extractURL(i.content),
      }));

    setRssOptions(options as unknown as RssOption[]);
  };

  useEffect(() => {
    init();
  }, []);

  const handleFetchData = async (url: string) => {
    setLoading(true);
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
    }).then((res) => {
      return res.text();
    });
    if (!res) return;
    const feed = await parser.parseString(res);
    console.log("feed", feed);
    const items = feed.items;
    setFeedList(items);
    setLoading(false);
  };

  const handleDrawerToggle = (visible: boolean) => {
    setDrawerVisible(visible);
  };

  const handleAddFeed = async () => {
    setLoading(true);
    try {
      const baseUrl = extractBaseURL(currntRssUrl);
      if (!baseUrl) return;
      const result = await getLinkPreview(baseUrl);
      if (result.url) {
        if (!configPage) return;
        await logseq.Editor.appendBlockInPage(configPage.uuid, currntRssUrl, {
          properties: formatObject(result),
        });
        setMessageInfo({
          open: true,
          type: "success",
          value: "Added successfully",
        });
        init();
        setDialogVisible(false);
        setLoading(false);
      }
    } catch (e: any) {
      setMessageInfo({ open: true, type: "error", value: e?.message || e });
      setLoading(false);
    }
  };

  const handleClose = () => {
    logseq.hideMainUI();
  };

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  if (visible) {
    return (
      <main className="logseq-rss-reader-plugin-main">
        <div ref={innerRef} className="rss-reader-main">
          <Box sx={{ display: "flex", height: "100%" }}>
            <CssBaseline />
            <AppBar position="fixed" open={drawerVisible}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => handleDrawerToggle(true)}
                  edge="start"
                  sx={{
                    marginRight: 5,
                    ...(drawerVisible && { display: "none" }),
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  Mini variant drawer
                </Typography>
                <Button
                  color="inherit"
                  onClick={() => handleFetchData(rssOptions[0].feedUrl)}
                >
                  Refresh
                </Button>
                <Button color="inherit" onClick={handleClose}>
                  Close
                </Button>
              </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={drawerVisible}>
              <DrawerHeader>
                <IconButton onClick={() => handleDrawerToggle(false)}>
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </DrawerHeader>
              <Divider />
              <List>
                {rssOptions.map((rss) => (
                  <ListItem
                    key={rss.url}
                    disablePadding
                    sx={{ display: "block" }}
                  >
                    <Tooltip title={rss.feedUrl}>
                      <ListItemButton
                        onClick={() => handleFetchData(rss.feedUrl)}
                      >
                        <ListItemAvatar>
                          <Avatar src={rss.favicons} />
                        </ListItemAvatar>
                        <ListItemText>{rss.title}</ListItemText>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "16px 0",
                }}
              >
                <Zoom
                  in={drawerVisible}
                  timeout={transitionDuration}
                  style={{
                    transitionDelay: `${
                      drawerVisible ? transitionDuration.exit : 0
                    }ms`,
                  }}
                  unmountOnExit
                >
                  <Fab
                    aria-label="add"
                    color="primary"
                    onClick={() => setDialogVisible(true)}
                  >
                    <AddIcon />
                  </Fab>
                </Zoom>
              </Box>
            </Drawer>
            <Box
              component="main"
              padding={0}
              display="flex"
              height="100%"
              sx={{ flexGrow: 1 }}
            >
              <Box
                component="div"
                sx={{ width: 350, backgroundColor: "blanchedalmond" }}
              >
                <List sx={{ height: "100%", width: "100%", overflow: "auto" }}>
                  {feedList.map((feed) => (
                    <ListItem key={feed.link}>
                      <ListItemButton>
                        <ListItemText>{feed.title}</ListItemText>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box
                component="div"
                sx={{ flexGrow: 1, backgroundColor: "chocolate" }}
              >
                2
              </Box>
            </Box>
          </Box>
          <Dialog
            fullWidth
            open={dialogVisible}
            onClose={() => setDialogVisible(false)}
          >
            <DialogTitle>Add RSS</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="RSS URL"
                type="email"
                fullWidth
                variant="standard"
                onChange={(e) => setCurrntRssUrl(e.target.value)}
              />
              <FormHelperText>
                This URL will be added to your
                <span style={{ color: "#333", fontWeight: 700 }}>
                  {` .rss-config `}
                </span>
                page
              </FormHelperText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogVisible(false)}>Cancel</Button>
              <LoadingButton
                disabled={!currntRssUrl}
                loading={loading}
                onClick={handleAddFeed}
              >
                Add
              </LoadingButton>
            </DialogActions>
          </Dialog>
          <Backdrop open={loading} style={{ zIndex: 9999 }}>
            <CircularProgress color="primary" />
          </Backdrop>
          {messageInfo.open && (
            <Message
              open={messageInfo.open}
              type={messageInfo.type}
              value={messageInfo.value}
            />
          )}
        </div>
      </main>
    );
  }
  return null;
}

export default App;
