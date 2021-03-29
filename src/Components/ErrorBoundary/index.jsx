import PropTypes from 'prop-types';
import React from 'react';

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
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
    // You can also log the error to an error reporting service
    //logErrorToMyService(error, errorInfo);
    console.log(error);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
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
