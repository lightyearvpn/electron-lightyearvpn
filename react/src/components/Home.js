import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CircularProgress from '@material-ui/core/CircularProgress';
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew';
const { ipcRenderer } = window.require('electron')

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '100vh',
  },
  vpnStatus: {
    marginTop: 16,
    marginBottom: 16,
  },
  fabProgress: {
    color: theme.palette.success.main,
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  textField: { 
    width: 266, 
    margin: 4,
    backgroundColor: 'white',
  },
  menu: {
    width: 266, 
    margin: 4,
    backgroundColor: 'white',
  },
  lightTooltip: {
    color: 'white',
    backgroundColor: '#000000dd',
    fontSize: 12,
    fontWeight: 500,
  },
});

const menuItems = [
  "rc4-md5",
  "aes-128-gcm",
  "aes-192-gcm",
  "aes-256-gcm",
  "aes-128-cfb",
  "aes-192-cfb",
  "aes-256-cfb",
  "aes-128-ctr",
  "aes-192-ctr",
  "aes-256-ctr",
  "camellia-128-cfb",
  "camellia-192-cfb",
  "camellia-256-cfb",
  "bf-cfb",
  "chacha20-ietf-poly1305",
  "xchacha20-ietf-poly1305",
  "salsa20",
  "chacha20",
  "chacha20-ietf",
]

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  componentDidMount() { 
  }

  // vpnStatus is in store but not persisted
  // ip and others are in store and persisted
  connectOnClick = async () => {
    console.log('connectOnClick invoked')
    let { type, vpnStatus } = this.props;
    if (vpnStatus === 'connected' || vpnStatus === 'connecting') return;
    this.startSslocal()
  }

  startSslocal = async () => {
    console.log('startSslocal invoked')
    const { ip, port, password, method, mode, localAddress, localPort, privoxyPort } = this.props;
    console.log(this.props)

    if (!ip) {
      ipcRenderer.send('show-error', { title: "错误", message: "IP missing or invalid!" });
      return;
    }
    // todo, validate port
    if (!port) {
      ipcRenderer.send('show-error', { title: "错误", message: "Port missing or invalid!" });
      return;
    }
    if (!password) {
      ipcRenderer.send('show-error', { title: "错误", message: "Password missing or invalid!" });
      return;
    }
    if (!method) {
      ipcRenderer.send('show-error', { title: "错误", message: "Method missing or invalid!" });
      return;
    }
    if (!mode) {
      ipcRenderer.send('show-error', { title: "错误", message: "Mode missing or invalid!" });
      return;
    }
    if (!localAddress) {
      ipcRenderer.send('show-error', { title: "错误", message: "Local address missing or invalid!" });
      return;
    }
    if (!localPort) {
      ipcRenderer.send('show-error', { title: "错误", message: "Local port missing or invalid!" });
      return;
    }
    if (!privoxyPort) {
      ipcRenderer.send('show-error', { title: "错误", message: "Privoxy port missing or invalid!" });
      return;
    }
    
    try  {
      ipcRenderer.send('startSslocal', { config: { ip, port, password, method, mode, localAddress, localPort, privoxyPort } });
      ipcRenderer.once('startSslocal-reply', (event, result) => {
        if (result.error) {
          console.log('connect error', result.error.message)
          return;
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  disconnectOnClick = () => {
    console.log('disconnectOnClick invoked')
    this.stopSslocal()
  }

  stopSslocal = () => {
    console.log('stopSslocal invoked')
    ipcRenderer.send('stopSslocal');
    ipcRenderer.once('stopSslocal-reply', (event, result) => {
      if (result.error) {
        console.log('disconnect error', result.error.message)
      }
    })
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  };

  handleClose = (event) => {
    const { myValue } = event.currentTarget.dataset;
    if (myValue) {
      this.setState({ anchorEl: null })
      this.props.setMethod(myValue)
    } else this.setState({ anchorEl: null })
  };

  renderConnectionStatus = () => {
    let { classes, vpnStatus } = this.props;
    let currentStatus = ''

    switch (vpnStatus) {
      case 'connecting':
        currentStatus = '连接中';
        break
      case 'connected':
        currentStatus = '已连接';
        break
      case 'not_connected':
        currentStatus = '未连接';
        break
      default:
        currentStatus = '未连接';
    }

    return (
      <Typography className={classes.vpnStatus} variant="body1">
        {currentStatus}
      </Typography>
    )
  }

  renderConnectButton = () => {
    let { classes, vpnStatus } = this.props;
    let button;

    if (vpnStatus === 'connected') {
      button = (
        <Fab 
          onClick={this.disconnectOnClick}
          color='primary'
          style={{ backgroundColor: '#28a745' }}
          disableRipple
          size="large"
          aria-label="Disconnect" 
        >
          <PowerSettingsNew fontSize='large'/>
        </Fab>
      )
    } else if (vpnStatus === 'connecting') {
      button = (
        <Fab 
          onClick={this.disconnectOnClick}
          color="inherit"
          disableRipple
          disabled
          size="large"
          aria-label="Connecting" 
        >
          <PowerSettingsNew fontSize='large'/>
          <CircularProgress size={68} className={classes.fabProgress} />
        </Fab>
      )
    } else {
      button = (
        <Tooltip title="点击连接" placement="bottom" classes={{ tooltip: classes.lightTooltip }} disableFocusListener={true} >
          <Fab 
            onClick={this.connectOnClick}
            color='inherit'
            disableRipple
            size="large"
            aria-label="Connect" 
          >
            <PowerSettingsNew fontSize='large'/>
          </Fab>
        </Tooltip>
      )
    }

    return (
      button
    )
  } 

  renderTextFields = () => {
    let { classes, ip, port, password, method } = this.props;
    let { anchorEl } = this.state;

    return (
      <FormGroup>
        <TextField 
          id="ip" 
          variant="outlined"
          size="small"
          label="IP"
          placeholder="输入服务器IP"
          value={ip}
          className={classes.textField}
          onChange={(event) => {
            this.props.setIp(event.target.value)
          }}
        />
        <TextField 
          id="port" 
          variant="outlined"
          size="small"
          type="number"
          label="Port"
          placeholder="输入服务器端口"
          inputProps={{ min: 1024, max: 65535 }}
          value={port}
          className={classes.textField}
          onChange={(event) => {
            this.props.setPort(event.target.value)
          }}
          onBlur={() => {
            
          }}
        />
        <TextField 
          id="password" 
          variant="outlined"
          size="small"
          label="Password"
          placeholder="输入密码"
          value={password}
          className={classes.textField}
          onChange={(event) => {
            this.props.setPassword(event.target.value)
          }}
        />
        <div className={classes.menu}>
          <Button 
            aria-controls="simple-menu"
            aria-haspopup="true" 
            label="Method"
            variant="outlined"
            style={{ width: '100%', color: 'rgba(0, 0, 0, 0.54)' }}
            onClick={this.handleClick}
          >
            {method}
            <KeyboardArrowRightIcon />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={this.handleClose}
          >
            {menuItems.map((item, index) => {
              return <MenuItem key={index} style={{ width: 266 }} selected={item === method} data-my-value={item} onClick={this.handleClose}>{item}</MenuItem>
            })}
          </Menu>
        </div>
      </FormGroup>
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {this.renderConnectButton()}
        {this.renderConnectionStatus()}
        {this.renderTextFields()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    vpnStatus: state.vpnStatusReducer,
    ip: state.ipReducer,
    port: state.portReducer,
    password: state.passwordReducer,
    method: state.methodReducer,
    mode: state.modeReducer,
    localAddress: state.localAddressReducer,
    localPort: state.localPortReducer,
    privoxyPort: state.privoxyPortReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setVpnStatus: (vpnStatus) => dispatch({
      type: 'SET_VPN_STATUS',
      vpnStatus,
    }),
    setIp: (ip) => dispatch({
      type: 'SET_IP',
      ip,
    }),
    setPort: (port) => dispatch({
      type: 'SET_PORT',
      port,
    }),
    setPassword: (password) => dispatch({
      type: 'SET_PASSWORD',
      password,
    }),
    setMethod: (method) => dispatch({
      type: 'SET_METHOD',
      method,
    }),
    setMode: (mode) => dispatch({
      type: 'SET_MODE',
      mode,
    }),
    setLocalAddress: (localAddress) => dispatch({
      type: 'SET_LOCAL_ADDRESS',
      localAddress,
    }),
    setLocalPort: (localPort) => dispatch({
      type: 'SET_LOCAL_PORT',
      localPort,
    }),
    setPrivoxyPort: (privoxyPort) => dispatch({
      type: 'SET_PRIVOXY_PORT',
      privoxyPort,
    }),
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Home));
