import PropTypes from 'prop-types';
import React from 'react';

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return {
      error: error,
      hasError: true,
    };
  }

  static propTypes = { children: PropTypes.element.isRequired };

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  shouldComponentUpdate() {
    return true;
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return (
        <div>
          Something went wrong.
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
