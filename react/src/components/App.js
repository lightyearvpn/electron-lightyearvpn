import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Home from './Home';
const { ipcRenderer } = window.require('electron')
const CHECK_STORE_INTERVAL = 100;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      contrastText: '#f5f4f3',
    },
    secondary: {
      main: '#FF3158',
      contrastText: '#f5f4f3',
    },
  },
});

const styles = theme => ({
  root: {
    height: '100vh',
  },
})

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.checkStore()
    setInterval(() => {
      this.checkStore()
    }, CHECK_STORE_INTERVAL)
  }

  checkStore = () => {
    let result = ipcRenderer.sendSync('getStatus');
    if (result !== this.props.vpnStatus) {
      this.props.setVpnStatus(result)
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <Home />
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    vpnStatus: state.vpnStatusReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setVpnStatus: (vpnStatus) => dispatch({
      type: 'SET_VPN_STATUS',
      vpnStatus,
    }),
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(App));
