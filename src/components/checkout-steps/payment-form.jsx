import React, { Component } from 'react';
import { Field, reduxForm, formValueSelector, SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Layout from "../layout";
import BaseCheckoutLayout from "./base-checkout-layout";
import CardFields from './payment/card-fields';
import CheckoutStepCalculator from '../../services/checkout-step-calculator';
import ErrorMessageFormatter from '../../services/error-message-formatter';

class PaymentForm extends Component {

  /* Render this step only if order is present and in a valid checkout state. */
  componentWillMount() {
    let order = this.props.order;

    if (!CheckoutStepCalculator.isStepEditable(order.checkout_steps, 'payment', order.state)){
      this.props.handleCheckoutStepNotEditable(order, this.props.placedOrder);
    }
  };

  componentDidMount() {
    this.props.setCurrentCheckoutStep();
  };

  handlePaymentFormSubmit (formData) {
    return this.props.handlePaymentFormSubmit(formData, this.props.order).then((response) => {
    },
    (error) => {
      let sanitizedErrors = this.formattedErrorMessages(error.response.body.errors);
      this.props.showFormErrors(sanitizedErrors);

      throw new SubmissionError({ order: sanitizedErrors });
    });
  };

  render() {
    const { handleSubmit, valid, submitting, order } = this.props;
    let paymentMethods = order.payment_methods || [];
    let paymentMethodMarkup = paymentMethods.map((paymentMethod, idx) => {
      return (
        <div key={ idx } className={"checkout-payment-options "} >
          <label>
            <Field name={ `order[payments_attributes][0][payment_method_id]` }
                  component="input"
                  type="radio"
                  value={ `${paymentMethod.id}` } />
            <span className={ "pay-method " + paymentMethod.name.replace(' ', '' ).toLocaleLowerCase() }></span>
            { paymentMethod.name }
          </label>
        </div>
      )
    });
    return (
      <Layout>
        <BaseCheckoutLayout currentStep="payment"
                            displayLoader={ this.props.displayLoader }
                            checkoutSteps={ order.checkout_steps || [] } >
          <form onSubmit={ handleSubmit(this.handlePaymentFormSubmit.bind(this)) }>
            
            <div className="checkout-payment-options-block">
              { paymentMethodMarkup }
            </div>
            { this.props.useCard==="2" &&
              <CardFields />
            }
            <div className="checkout-payment-button-block">
              <button type="submit"
                      className="button-primary"
                      disabled={ !valid || submitting } >
                <FormattedMessage
                  id="label.buttons.savePayment"
                  defaultMessage="Save Payment Details"
                />
              </button>
            </div>
          </form>
        </BaseCheckoutLayout>
      </Layout>
    );
  };

  formattedErrorMessages (errors) {
    let formErrors = errors['payments.Credit Card'];
    return ErrorMessageFormatter.formatFormSubmissionErrors(formErrors);
  };
};

PaymentForm = reduxForm({
  form: 'paymentForm'
})(PaymentForm);

const selector = formValueSelector('paymentForm');
PaymentForm = connect(
  state => {
    const useCard = selector(state, 'order[payments_attributes][0][payment_method_id]');
    return {
      useCard
    };
  }
)(PaymentForm)

export default PaymentForm;
