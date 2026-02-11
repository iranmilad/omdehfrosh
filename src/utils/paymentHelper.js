import axios from 'axios';
import { getApiUrl } from '../Libs/utils/apiutils/apiutils';

/**
 * Payment: get-payment-link returns { link, body }. Form POST to link with body → backend redirects to /payment-listener/?transactionId=&success= → frontend POSTs to get { link, message }.
 */

const DEBUG = true; // set false to disable payment flow logs
const DEBUG_DELAY_MS = 5000; // delay before redirect so you can see logs in console (only when DEBUG)
const log = (...args) => DEBUG && console.log('[PAYMENT]', ...args);
const logErr = (...args) => DEBUG && console.error('[PAYMENT]', ...args);

export const initiatePayment = async (paymentData) => {
  try {
  const { order_id, gateway, amount } = paymentData;
  const geteway = gateway || paymentData.geteway;

    const token = localStorage.getItem("user");
    const apiUrl = getApiUrl('/universal-payment/get-payment-link');
    const requestBody = { gateway: gateway || geteway };
    if (order_id) {
      requestBody.order_id = order_id;
      // order payment: backend gets amount from order; do not send amount
    } else if (amount != null && amount !== '') {
      requestBody.amount = amount;
      // wallet recharge only: amount + gateway
    }

    log('1. get-payment-link request', { apiUrl, requestBody, hasToken: !!token });

    try {
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      

      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        logErr('get-payment-link failed', fetchResponse.status, errorText);
        throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
      }

      const responseData = await fetchResponse.json();
      log('2. get-payment-link response', { link: responseData?.link, body: responseData?.body ? Object.keys(responseData.body) : [] });

      const response = {
        status: fetchResponse.status,
        data: responseData,
        headers: fetchResponse.headers
      };

      if (response.data && response.data.link && response.data.body) {
        return {
          success: true,
          link: response.data.link,
          body: response.data.body
        };
      } else {
        logErr('get-payment-link invalid response - missing link or body', response.data);
        return {
          success: false,
          error: 'Invalid response from server - missing link or body'
        };
      }
    } catch (fetchError) {
      throw fetchError;
    }
  } catch (error) {
    logErr('initiatePayment error', error?.message || error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'خطا در ایجاد لینک پرداخت'
    };
  }
};

/**
 * Form POST body to link; backend redirects to /payment-listener/?transactionId=&success=; frontend gets { link, message }.
 */
export const redirectToGateway = (link, body) => {
  if (!link || !body) {
    logErr('redirectToGateway skipped - missing link or body', { link: !!link, body: !!body });
    return;
  }
  log('3. form POST redirect', { link, body: Object.keys(body) });

  const doSubmit = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = link;
    form.style.display = 'none';
    Object.keys(body).forEach((key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = typeof body[key] === 'object' ? JSON.stringify(body[key]) : String(body[key]);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  if (DEBUG && DEBUG_DELAY_MS > 0) {
    log(`4. redirecting in ${DEBUG_DELAY_MS / 1000}s – check Console for logs`);
    setTimeout(doSubmit, DEBUG_DELAY_MS);
  } else {
    log('4. redirecting user to gateway (form POST)');
    doSubmit();
  }
};

/**
 * Complete payment flow
 * @param {object} paymentData - Payment data (order_id + gateway OR amount + gateway)
 * @returns {Promise<boolean>} - Success status
 */
export const processPayment = async (paymentData) => {
  try {
    log('0. processPayment start', paymentData);
    const result = await initiatePayment(paymentData);

    if (result && result.success === true) {
      if (!result.link || !result.body) {
        logErr('processPayment: missing link or body in result', result);
        throw new Error('Invalid payment response: missing link or body');
      }
      redirectToGateway(result.link, result.body);
      return true;
    } else {
      logErr('processPayment failed', result?.error || 'no link/body');
      return false;
    }
  } catch (error) {
    logErr('processPayment error', error?.message || error);
    return false;
  }
};
