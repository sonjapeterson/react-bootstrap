import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Fade from './Fade';
import addClass from 'dom-helpers/class/addClass';
import elementType from 'react-prop-types/lib/elementType';
import createChainedFunction from './utils/createChainedFunction';
import tbsUtils from './utils/bootstrapUtils';
import * as tabUtils from './utils/tabUtils';

let animationPropType = PropTypes.oneOfType([
  PropTypes.bool,
  elementType
]);

let TabPane = React.createClass({
  propTypes: {
    eventKey: PropTypes.any,
    animation: animationPropType,
    'aria-labelledby': PropTypes.string,

    onEnter: PropTypes.func,
    onEntering: PropTypes.func,
    onEntered: PropTypes.func,

    onExit: PropTypes.func,
    onExiting: PropTypes.func,
    onExited: PropTypes.func
  },

  contextTypes: {
    $bs_tabcontent_bsClass: PropTypes.string,
    $bs_tabcontent_animation: animationPropType,
    $bs_tabcontent_activeKey: PropTypes.any,
    $bs_tabcontent_onExited: PropTypes.func,
    $bs_tabcontainer_idMap: PropTypes.shape({
      set: PropTypes.func,
      panes: PropTypes.object,
      tabs: PropTypes.object,
    })
  },

  componentWillMount() {
    this.exited = !this.isActive();
    this.setId(this.props, this.context);
  },

  componentWillUpdate(nextProps, _, nextContext) {
    this.setId(nextProps, nextContext);

    if (this.isActive(nextProps, nextContext)) {
      this.exited = false;
    } else if (!this.exited && !this.getTransition(nextProps, nextContext)) {
      // Otherwise let handleHidden take care of marking exited.
      this.exited = true;
      this._fireExitedCallback = true;
    }
  },

  componentDidUpdate() {
    if (this._fireExitedCallback) {
      this._fireExitedCallback = false;
      this.onExited();
    }
  },

  getTransition(props = this.props, context = this.context) {
    return props.animation != null
      ? props.animation
      : context.$bs_tabcontent_animation;
  },

  isActive(props = this.props, context = this.context) {
    return context.$bs_tabcontent_activeKey === props.eventKey;
  },

  render() {
    let active = this.isActive();
    let visible = active || !this.exited;
    let bsClass = this.props.bsClass || this.context.$bs_tabcontent_bsClass;

    let Transition = this.getTransition();

    let classes = {
      active: visible,
      [tbsUtils.prefix({ bsClass }, 'pane')]: true
    };

    let {
        eventKey, id
      , 'aria-labelledby': labelledBy
      , onExit, onExiting, onExited
      , onEnter, onEntering, onEntered } = this.props;

    let ids = this.context.$bs_tabcontainer_idMap;

    id = ids ? ids.panes.get(eventKey) : id;
    labelledBy = ids ? ids.tabs.get(eventKey) : labelledBy;

    if (Transition === true) {
      Transition = Fade;
    }

    if (Transition === false) {
      Transition = null;
    }

    let tabPane = (
      <div {...this.props}
        id={id}
        role="tabpanel"
        aria-hidden={!visible}
        aria-labelledby={labelledBy}
        className={classNames(this.props.className, classes, { in: !Transition })}
      >
        { this.props.children }
      </div>
    );

    if (Transition) {
      tabPane = (
        <Transition
          in={active}
          onExit={onExit}
          onExiting={onExiting}
          onExited={createChainedFunction(this.handleExited, onExited)}
          onEnter={createChainedFunction(this.handleEnter, onEnter)}
          onEntering={onEntering}
          onEntered={onEntered}
        >
          { tabPane }
        </Transition>
      );
    }

    return tabPane;
  },

  onExited() {
    if (this.context.$bs_tabcontent_onExited) {
      this.context.$bs_tabcontent_onExited(
        this.props.eventKey
      );
    }
  },

  handleEnter(node) {
    // ref: https://github.com/react-bootstrap/react-overlays/issues/40
    if (this.isActive()) {
      addClass(node, 'active');
      node.offsetWidth; // eslint-disable-line no-unused-expressions
    }
  },

  handleExited() {
    this.exited = true;
    this.onExited();
    this.forceUpdate();
  },

  setId(props, context) {
    if (context.$bs_tabcontainer_idMap) {
      let map = context.$bs_tabcontainer_idMap;

      map.set('panes', props.eventKey,
        tabUtils.getPaneId(props, map.id)
      );
    }
  }
});

export default TabPane;
