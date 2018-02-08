import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import DateInput from '../components/date_input';

import { fetchLastLocs, fetchVehicles } from '../actions/vehicles';
import { changeNavbarHeight, changeVehicleBarCollapsed } from '../actions/style';
import { fetchProfile } from '../actions/users';

import { PERMISSIONS_URL_CHUNK, VEHICLES_URL_CHUNK } from '../constants/UrlChunks';

import { debounce } from '../helpers/help_fncs';


class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.debouncedfetchVehicles = debounce(this.props.fetchVehicles, 500);
    this.debouncedfetchLastLocs = debounce(this.props.fetchLastLocs, 500);
    this.calcHeight = this.calcHeight.bind(this);
    this.state = { searchText: '' };
  }
  
  componentDidMount() {
    this.calcHeight();
    window.addEventListener('resize', this.calcHeight);

    this.props.fetchProfile();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calcHeight);
  }

  componentDidUpdate() {
    const height = this.nav.offsetHeight;
    if(height !== this.props.height) {
      this.calcHeight();
    }
  }

  calcHeight() {
    const height = this.nav.offsetHeight;
    this.props.changeNavbarHeight(height);
  }

  onSearchTextChange({ target: { value } }) {
    this.setState({ searchText: value });
    // Dla widoku mapy
    if(this.props.activePath === '/') {
      if(this.props.vehiclebarMounted && this.props.vehiclebarCollapsed) {
        this.props.changeVehicleBarCollapsed();
      }
      if(!this.props.lastLocsPending) {
        this.debouncedfetchLastLocs(value);
      }
    }
    // Dla widoku urządzeń
    else if(this.props.activePath === `/${VEHICLES_URL_CHUNK}`) {
      if(!this.props.vehiclesPending) {
        this.debouncedfetchVehicles(value);
      }
    }
  }

  renderSearchBar() {
    if(this.props.activePath === `/${PERMISSIONS_URL_CHUNK}`) {
      return null;
    }

    return (
      <form className="d-flex twd-search flex-row col-lg-5 col-md-5" onSubmit={e => e.preventDefault()}>
        <input
          className="form-control mr-2 col"
          type="text"
          placeholder="wyszukaj urządzenie..."
          value={this.state.searchText}
          onChange={this.onSearchTextChange.bind(this)}
        />
        <button className="btn btn-primary" type="submit">Szukaj</button>
      </form>
    );
  }

  renderDateInput() {
    if(
      this.props.activePath === `/${PERMISSIONS_URL_CHUNK}` ||
      this.props.activePath === `/${VEHICLES_URL_CHUNK}`
    ) {
      return null;
    }

    return (
      <form className="col-lg-2">
        <DateInput className="date-from" placeholder="od..."/>
      </form>
    );
  }

  renderUsername() {
    if(!this.props.userProfile) {
      return 'Wczytywanie...';
    }

    const { USR_Name, USR_Surname } = this.props.userProfile;
    return `${USR_Name} ${USR_Surname}`;
  }

  render() {
    return (
      <nav className='navbar navbar-expand-md bg-secondary twd-nav' style={{ zIndex: 401 }} ref={nav => this.nav = nav}>
        <div className='container-fluid'>
          <a className='navbar-brand col-lg-1 col-md-1'>
            <span style={{color: 'black'}}>TWD</span>
          </a>
          <button id="nav-toggle" className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse col-lg-11 col-md-11" id="navbarSupportedContent">
            {this.renderSearchBar.bind(this)()}
            {this.renderDateInput.bind(this)()}
            <div className="btn-group col-lg-2 twd-account">
              <button className="btn twd-btn-account dropdown-toggle" data-toggle="dropdown"> 
                <i className="fa fa-user fa-lg fa-user-circle-o"></i>
                <span className="name-account"> {this.renderUsername()}</span>
              </button>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#" style={{textAlign: 'center'}}>konto</a>
                <Link to='/logout' className="dropdown-item">wyloguj link</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    height: state.style.navbar.height,
    userProfile: state.users.profile,
    vehiclebarMounted: state.style.vehiclebar.mounted,
    vehiclebarCollapsed: state.style.vehiclebar.collapsed,
    lastLocsPending: state.vehicles.lastlocsPending,
    vehiclesPending: state.vehicles.vehiclesPending
  };
}

const actions = {
  changeNavbarHeight,
  fetchProfile,
  changeVehicleBarCollapsed,
  fetchLastLocs,
  fetchVehicles
};


export default connect(mapStateToProps, actions)(Navbar);
