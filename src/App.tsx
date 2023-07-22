import { PageEntity } from "@logseq/libs/dist/LSPlugin";
import React, { useEffect, useState, useRef } from "react";
import Parser from "rss-parser";
import { getLinkPreview } from "link-preview-js";
import parse from "html-react-parser";
import TurndownService from "turndown";

import {
  styled,
  useTheme,
  Theme,
  CSSObject,
  useColorScheme,
} from "@mui/material/styles";
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
import Grid from "@mui/material/Unstable_Grid2";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import Zoom from "@mui/material/Zoom";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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
import { LogseqTheme } from "./constants";

import "./index.css";
import { articleStyle } from "./style";

const rssList = [
  "http://www.ruanyifeng.com/blog/atom.xml",
  "https://www.reddit.com/.rss",
  "https://sspai.com/feed",
  "https://xinquji.com/rss",
  "http://feed.appinn.com/",
  "https://xinquji.com/rss",
  "https://www.woshipm.com/feed",
  "https://www.zhangxinxu.com/wordpress/feed/",
  "https://coolshell.cn/feed",
  "https://liriansu.com/index.xml",
  "https://chensy.cn/post/index.xml",
  "http://googoo.run/rss.xml",
  "https://www.skyue.com/feed/",
];

const drawerWidth = 240;

const getCustomColor = (logseqTheme: LogseqTheme) => ({
  color: {
    [LogseqTheme.Light]: "#333",
    [LogseqTheme.Dark]: "#ddd",
  }[logseqTheme],
  backgroundColor: {
    [LogseqTheme.Light]: "#ddd",
    [LogseqTheme.Dark]: "#333",
  }[logseqTheme],
});

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
  width: `calc(${theme.spacing(6)} +  1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
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

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>Are you sure you want to delete?</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function App() {
  const { mode, setMode } = useColorScheme();
  const visible = useAppVisible();
  const theme = useTheme();
  const articleRef = useRef<Element>(null);
  const parser = new Parser();
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    linkStyle: "inlined",
  });
  const [rssOptions, setRssOptions] = useState<RssOption[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentRssUrl, setCurrentRssUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageInfo, setMessageInfo] = useState<{
    open: boolean;
    type: "success" | "info" | "warning" | "error";
    value: string;
    autoHideDuration?: number | null;
  }>({
    open: false,
    type: "success",
    value: "",
  });
  const [configPage, setConfigPage] = useState<PageEntity | null>(null);
  const [feedList, setFeedList] = useState<Parser.Item[]>([]);
  const [currentFeed, setCurrentFeed] = useState<Parser.Item | null>(null);
  const [logseqTheme, setLogseqTheme] = useState<LogseqTheme>(LogseqTheme.Dark);
  const [currntItemIndex, setCurrntItemIndex] = useState<number | null>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [allPages, setAllPages] = useState<PageEntity[]>([]);

  const init = async () => {
    const { preferredThemeMode } = await logseq.App.getUserConfigs();
    setLogseqTheme(preferredThemeMode as LogseqTheme);
    setMode(preferredThemeMode);
    let rssConfigPage;
    rssConfigPage = await logseq.Editor.getPage("rss-config");

    if (!rssConfigPage) {
      rssConfigPage = await logseq.Editor.createPage(
        "rss-config",
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
    const allPages = await logseq.Editor.getAllPages();
    setAllPages(allPages || []);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (rssOptions.length > 0) {
      const feedUrl = currentRssUrl || rssOptions[0].feedUrl;
      handleFetchData(feedUrl);
    }
  }, [rssOptions]);

  useEffect(() => {
    if (feedList.length > 0) {
      setCurrentFeed(feedList[0]);
    }
  }, [feedList]);

  const handleFetchData = async (url: string) => {
    setCurrentRssUrl(url);
    setLoading(true);
    try {
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
    } catch (e: any) {
      setMessageInfo({
        open: true,
        type: "error",
        value: e?.message || e || "未知错误",
      });
      setLoading(false);
    }
  };

  const handleDrawerToggle = (visible: boolean) => {
    setDrawerVisible(visible);
  };

  const handleAddFeed = async () => {
    setLoading(true);
    try {
      const baseUrl = extractBaseURL(currentRssUrl);
      if (!baseUrl) {
        setLoading(false);
        setMessageInfo({
          open: true,
          type: "warning",
          value: "Invalid URL",
        });
        return;
      }
      const result = await getLinkPreview(baseUrl);
      if (result.url) {
        if (!configPage) return;
        await logseq.Editor.appendBlockInPage(configPage.uuid, currentRssUrl, {
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

  const handleDelete = async (feedurl: string) => {
    if (!configPage?.uuid) return;
    const tree = await logseq.Editor.getPageBlocksTree(configPage?.uuid);
    const block = tree.find((i) => i.content.startsWith(feedurl));
    if (!block?.uuid) return;
    logseq.Editor.removeBlock(block?.uuid);

    const currentRssOptions = rssOptions.filter((i) => i.feedUrl !== feedurl);
    if (!currentRssOptions.length) return;
    setCurrentRssUrl(rssOptions[(currntItemIndex || 1) - 1].feedUrl);
    setRssOptions(currentRssOptions);
    setIsDelete(false);
  };

  const handleSaveAsPage = async () => {
    setSaveLoading(true);
    if (!currentFeed) return;
    const page = await logseq.Editor.createPage(
      currentFeed.title || `未知页面-${new Date()}`,
      {
        "pub-date": currentFeed.pubDate,
        link: currentFeed.link,
      },
      {
        createFirstBlock: false,
        format: "markdown",
        journal: false,
      }
    );

    const markdown = turndownService.turndown(currentFeed.content || "");
    if (!page?.uuid || !markdown) return;
    const markdownList = markdown.split("\n").filter((i) => !!i);
    markdownList.forEach(async (i) => {
      await logseq.Editor.appendBlockInPage(page.uuid, i);
    });
    const allPages = await logseq.Editor.getAllPages();
    setAllPages(allPages || []);
    setMessageInfo({
      open: true,
      type: "success",
      value: "Saved successfully",
      autoHideDuration: null,
    });
    setSaveLoading(false);
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
      <main
        className="logseq-rss-reader-plugin-main"
        style={{ colorScheme: logseqTheme }}
      >
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            boxSizing: "border-box",
          }}
        >
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
                {rssOptions.find((i) => i.feedUrl === currentRssUrl)?.title}
              </Typography>
              <IconButton
                title="Toggle theme"
                color="inherit"
                onClick={() => {
                  setLogseqTheme((prev) =>
                    prev === LogseqTheme.Light
                      ? LogseqTheme.Dark
                      : LogseqTheme.Light
                  );
                  setMode(
                    mode === LogseqTheme.Dark
                      ? LogseqTheme.Light
                      : LogseqTheme.Dark
                  );
                }}
              >
                {logseqTheme === LogseqTheme.Light ? (
                  <LightModeIcon />
                ) : (
                  <DarkModeIcon />
                )}
              </IconButton>
              <IconButton title="Save to page" color="inherit">
                {currentFeed?.title &&
                allPages.map((i) => i.name).includes(currentFeed.title) ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <SaveAltIcon onClick={handleSaveAsPage} />
                )}
                {saveLoading && (
                  <CircularProgress
                    size={30}
                    sx={{
                      position: "absolute",
                      zIndex: 1,
                    }}
                  />
                )}
              </IconButton>
              <IconButton
                title="Refresh"
                color="inherit"
                onClick={() =>
                  handleFetchData(currentRssUrl || rssOptions[0].feedUrl)
                }
              >
                <RefreshIcon />
              </IconButton>
              <IconButton title="Close" color="inherit" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ flex: 1, width: "100vw", display: "flex" }}>
            <Drawer
              variant="permanent"
              open={drawerVisible}
              sx={{
                height: "100%",
                backgroundColor: getCustomColor(logseqTheme).backgroundColor,
              }}
            >
              <Box
                sx={{
                  ...getCustomColor(logseqTheme),
                  height: "100%",
                }}
              >
                <DrawerHeader>
                  <IconButton onClick={() => handleDrawerToggle(false)}>
                    {theme.direction === "rtl" ? (
                      <ChevronRightIcon
                        style={{
                          color: getCustomColor(logseqTheme).color,
                        }}
                      />
                    ) : (
                      <ChevronLeftIcon
                        style={{
                          color: getCustomColor(logseqTheme).color,
                        }}
                      />
                    )}
                  </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                  {rssOptions.map((rss, index) => (
                    <ListItem
                      key={rss.url}
                      disablePadding
                      sx={{ display: "block" }}
                      aria-selected
                      onMouseEnter={() => setCurrntItemIndex(index)}
                      onMouseLeave={() => setCurrntItemIndex(null)}
                    >
                      {/* <Tooltip TransitionComponent={Zoom} title={rss.feedUrl}> */}
                      <ListItemButton
                        selected={rss.feedUrl === currentRssUrl}
                        onClick={() => {
                          handleFetchData(rss.feedUrl);
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{ width: "28px", height: "28px" }}
                            src={rss.favicons}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          sx={{
                            overflow: "hidden",
                          }}
                        >
                          {rss.title}
                        </ListItemText>
                        {currntItemIndex === index && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentRssUrl(rss.feedUrl);
                              setIsDelete(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </ListItemButton>
                      {/* </Tooltip> */}
                    </ListItem>
                  ))}
                </List>
                <ConfirmDialog
                  open={isDelete}
                  onClose={() => setIsDelete(false)}
                  onConfirm={() => handleDelete(currentRssUrl)}
                />
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
                      size="small"
                      onClick={() => setDialogVisible(true)}
                    >
                      <AddIcon />
                    </Fab>
                  </Zoom>
                </Box>
              </Box>
            </Drawer>
            <Box component="main" padding={0} sx={{ width: 0, flex: 1 }}>
              <Grid container sx={{ height: "100vh", display: "flex" }}>
                <Grid
                  xs={3}
                  sx={{
                    color: {
                      [LogseqTheme.Light]: "#161514",
                      [LogseqTheme.Dark]: "#f4f4f4",
                    }[logseqTheme],
                    backgroundColor: {
                      [LogseqTheme.Light]: "#faf9f8",
                      [LogseqTheme.Dark]: "#282828",
                    }[logseqTheme],
                  }}
                >
                  <List
                    sx={{
                      width: "100%",
                      height: "calc(100vh - 64px)",
                      marginTop: "64px",
                      overflowY: "auto",
                    }}
                  >
                    {feedList.map((feed) => (
                      <ListItem disablePadding key={feed.link}>
                        <ListItemButton
                          selected={feed.link === currentFeed?.link}
                          onClick={() => {
                            setCurrentFeed(feed);
                            if (!articleRef.current) return;
                            articleRef.current.scrollTop = 0;
                          }}
                        >
                          <ListItemText>{feed.title}</ListItemText>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid xs={9}>
                  <Box
                    sx={{
                      ...articleStyle(logseqTheme),
                      height: "100vh",
                      margin: 0,
                      p: 4,
                      overflowY: "auto",
                      paddingTop: "64px",
                    }}
                    ref={articleRef}
                  >
                    <Box>
                      <h1>{currentFeed?.title}</h1>
                    </Box>
                    <Box>
                      <time>{currentFeed?.isoDate}</time>
                    </Box>
                    <Divider
                      color={getCustomColor(logseqTheme).color}
                      sx={{ my: 1 }}
                    />
                    {/* TODO: 搞一个空内容展示 */}
                    <Box>
                      <Typography>
                        {parse(currentFeed?.content || "", {
                          replace: (domNode: any) => {
                            if (
                              domNode.type === "tag" &&
                              domNode.name === "a"
                            ) {
                              return (
                                <a
                                  target="_blank"
                                  href={domNode.attribs.href}
                                  rel="noreferrer"
                                >
                                  {domNode.children[0].data}
                                </a>
                              );
                            }
                          },
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
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
              onChange={(e) => setCurrentRssUrl(e.target.value)}
            />
            <FormHelperText>
              This URL will be added to your
              <span
                style={{
                  color: getCustomColor(logseqTheme).color,
                  fontWeight: 700,
                }}
              >
                {` rss-config `}
              </span>
              page
            </FormHelperText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogVisible(false)}>Cancel</Button>
            <LoadingButton
              disabled={!currentRssUrl}
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
        <Message
          open={messageInfo.open}
          type={messageInfo.type}
          value={messageInfo.value}
          onClose={() =>
            setMessageInfo({
              ...messageInfo,
              open: false,
            })
          }
        />
      </main>
    );
  }
  return null;
}

export default App;
