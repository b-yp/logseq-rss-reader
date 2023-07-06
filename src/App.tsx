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
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";

import { extractURL, useAppVisible } from "./utils";
import { RssOption } from "./types";

import "./index.css";

const rssList = [
  "http://www.ruanyifeng.com/blog/atom.xml",
  "https://www.reddit.com/.rss",
  "https://sspai.com/feed",
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

  const init = async () => {
    let rssConfigPage;
    rssConfigPage = await logseq.Editor.getPage("rss-config");
    if (!rssConfigPage) {
      rssConfigPage = await logseq.Editor.createPage("rss-config");
    }
    if (!rssConfigPage?.uuid) return;
    const tree = await logseq.Editor.getPageBlocksTree(rssConfigPage?.uuid);

    const options = tree
      .filter((i) => !!i.content)
      .map((i) => ({
        ...i.properties,
        feedUrl: extractURL(i.content),
      }));

    setRssOptions(options as unknown as RssOption[]);
  };

  useEffect(() => {
    // init()
  }, []);

  const handleFetchData = async () => {
    // const result = await getLinkPreview("https://www.reddit.com");
    
    const res = await fetch("http://www.ruanyifeng.com/blog/atom.xml", {
      method: "GET",
      mode: "cors",
    }).then((res) => {
      return res.text();
    });
    if (!res) return;
    const feed = await parser.parseString(res);
    console.log("feed", feed);
  };

  const handleDrawerToggle = (visible: boolean) => {
    setDrawerVisible(visible);
  };

  const handleClose = () => {
    logseq.hideMainUI();
  };

  if (visible) {
    return (
      <main
        className="logseq-rss-reader-plugin-main"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} className="rss-reader-main">
          <Box sx={{ display: "flex" }}>
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
                <Button color="inherit" onClick={init}>
                  Test
                </Button>
                <Button color="inherit" onClick={handleFetchData}>
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
                      <ListItemButton>
                        <ListItemAvatar>
                          <Avatar src={rss.favicons?.[0]} />
                        </ListItemAvatar>
                        <ListItemText>{rss.title}</ListItemText>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <DrawerHeader />
              <Typography paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Rhoncus dolor purus non enim praesent elementum facilisis leo
                vel. Risus at ultrices mi tempus imperdiet. Semper risus in
                hendrerit gravida rutrum quisque non tellus. Convallis convallis
                tellus id interdum velit laoreet id donec ultrices. Odio morbi
                quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                adipiscing bibendum est ultricies integer quis. Cursus euismod
                quis viverra nibh cras. Metus vulputate eu scelerisque felis
                imperdiet proin fermentum leo. Mauris commodo quis imperdiet
                massa tincidunt. Cras tincidunt lobortis feugiat vivamus at
                augue. At augue eget arcu dictum varius duis at consectetur
                lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
                sapien faucibus et molestie ac.
              </Typography>
              <Typography paragraph>
                Consequat mauris nunc congue nisi vitae suscipit. Fringilla est
                ullamcorper eget nulla facilisi etiam dignissim diam. Pulvinar
                elementum integer enim neque volutpat ac tincidunt. Ornare
                suspendisse sed nisi lacus sed viverra tellus. Purus sit amet
                volutpat consequat mauris. Elementum eu facilisis sed odio
                morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
                tincidunt ornare massa eget egestas purus viverra accumsan in.
                In hendrerit gravida rutrum quisque non tellus orci ac.
                Pellentesque nec nam aliquam sem et tortor. Habitant morbi
                tristique senectus et. Adipiscing elit duis tristique
                sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
                eleifend. Commodo viverra maecenas accumsan lacus vel facilisis.
                Nulla posuere sollicitudin aliquam ultrices sagittis orci a.
              </Typography>
            </Box>
          </Box>
        </div>
      </main>
    );
  }
  return null;
}

export default App;
