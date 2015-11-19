import React, { PropTypes } from 'react';
import cn from 'classnames';
import warning from 'warning';
import elementType from 'react-prop-types/lib/elementType';
import tbsUtils, { bsClass as setBsClass } from './utils/bootstrapUtils';

let animationPropType = PropTypes.oneOfType([
  PropTypes.bool,
  elementType
]);

let TabContent = React.createClass({

  propTypes: {
    activeKey: PropTypes.any,
    componentClass: elementType,
    animation: animationPropType,
  },

  contextTypes: {
    $bs_tabcontainer: React.PropTypes.bool,
    $bs_tabcontainer_activeKey: React.PropTypes.any,
  },

  childContextTypes: {
    $bs_tabcontent_bsClass: PropTypes.string,
    $bs_tabcontent_animation: animationPropType,
    $bs_tabcontent_activeKey: PropTypes.any,
    $bs_tabcontent_onExited: PropTypes.func
  },

  getDefaultProps() {
    return {
      componentClass: 'div',
      animation: true
    };
  },

  getInitialState() {
    return {
      exitingPane: null
    };
  },

  getChildContext() {
    let { exitingPane } = this.state;
    return {
      $bs_tabcontent_bsClass: this.props.bsClass,
      $bs_tabcontent_animation: this.props.animation,
      $bs_tabcontent_activeKey: exitingPane ? undefined : this.getActiveKey(),
      $bs_tabcontent_onExited: this.handlePaneExited
    };
  },

  componentWillReceiveProps(nextProps, nextContext) {
    let currentActiveKey = this.getActiveKey();
    let nextActiveKey = this.getActiveKey(nextProps, nextContext);

    if (nextActiveKey !== currentActiveKey) {
      this.setState({
        exitingPane: currentActiveKey
      });
    }
  },

  getActiveKey(props = this.props, context = this.context) {
    let activeKey = props.activeKey;

    if (context.$bs_tabcontainer) {
      warning(activeKey == null,
        'Specifing a TabContent `activeKey` prop in the context of a `TabContainer` is not supported. ' +
        'Instead use `<TabContainer activeKey={' + activeKey + '} />`');

      activeKey = context.$bs_tabcontainer_activeKey;
    }
    return activeKey;
  },

  render() {
    let { className, children } = this.props;
    let Component = this.props.componentClass;

    let contentClass = tbsUtils.prefix(this.props, 'content');

    return (
      <Component className={cn(contentClass, className)}>
        { children }
      </Component>
    );
  },

  handlePaneExited() {
    this.setState({ exitingPane: null });
  }
});

export default setBsClass('tab', TabContent);
