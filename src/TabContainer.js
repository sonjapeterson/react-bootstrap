import React, { PropTypes } from 'react';
import uncontrollable from 'uncontrollable';
import elementType from 'react-prop-types/lib/elementType';

let TabContainer = React.createClass({

  propTypes: {
    /**
     * HTML id attribute
     */
    id: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),

    onSelect: PropTypes.func,
    activeKey: PropTypes.any,
    componentClass: elementType
  },

  childContextTypes: {
    $bs_tabcontainer: React.PropTypes.bool,
    $bs_tabcontainer_activeKey: PropTypes.any,
    $bs_tabcontainer_onSelect: PropTypes.func,
    $bs_tabcontainer_idMap: PropTypes.shape({
      set: PropTypes.func,
      panes: PropTypes.object,
      tabs: PropTypes.object,
    })
  },

  getDefaultProps() {
    return {
      componentClass: 'div'
    };
  },

  componentWillMount() {
    let ids = this._ids || (this._ids = {});

    ids.tabs = new Map();
    ids.panes = new Map();
    ids.set = this.registerChildID;
  },

  getChildContext() {
    this._ids.id = this.props.id;

    return {
      $bs_tabcontainer: true,
      $bs_tabcontainer_activeKey: this.props.activeKey,
      $bs_tabcontainer_onSelect: this.props.onSelect,
      $bs_tabcontainer_idMap: this._ids
    };
  },

  render() {
    let { children } = this.props;
    let Component = this.props.componentClass;

    return (
      <Component {...this.props}>
        { children }
      </Component>
    );
  },

  registerChildID(type, key, id) {
    let ids = this._ids;
    let old = ids[type].get(key);

    if (old !== id) {
      ids[type].set(key, id);
      this._needsUpdate = true;
    }

    clearTimeout(this._timer);
    this._timer = setTimeout(()=> {
      if (this._needsUpdate) {
        this._needsUpdate = false;
        this.forceUpdate();
      }
    });
  }
});

export default uncontrollable(TabContainer, { activeKey: 'onSelect' });
