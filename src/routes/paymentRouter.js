/*
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, HOPU, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 *  License-Identifier: EUPL-1.2
 *
 *  Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *    George Benos (Telesto Technologies)
 *    Germán Molina (HOPU)
 *
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');


/**
 * @swagger
 * /api/v1/payments/operations:
 * /api/v1/operations:
 *   get:
 *     tags: [Operations]
 *     summary: Get list of operations.
 *     description: >
 *       Allow to know the performed operations and the status of them. Return the list of operations. The API endpoint
 *       admit filter by transfer transferId, status, date or user but not combine them.
 *     parameters:
 *       - name: transferId
 *         in: query
 *         required: false
 *         description: Filter by transfer id auto-generated by the system of an operation.
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         required: false
 *         description: Filter by operation type. Allowed values "exchange_in", "exchange_out", "clearing".
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         required: false
 *         description: Filter by operation status. Allowed values "open" and "closed".
 *         schema:
 *           type: string
 *       - name: user
 *         in: query
 *         required: false
 *         description: >
 *           Filter by operation user address in hexadecimal format i.e. 0xb794f5ea0ba39494ce839613fffba74279579268
 *         schema:
 *           type: string
 *       - name: fromdate
 *         in: query
 *         required: false
 *         description: >
 *           Filter only the operations that took place after and incuding the date specified in UTC format i.e. 2021-03-30T15:22:50.145Z
 *         schema:
 *           type: date
 *       - name: todate
 *         in: query
 *         required: false
 *         description: >
 *           Filter only the operations that took place before the date specified in UTC format i.e. 2021-03-30T15:22:50.145Z
 *         schema:
 *           type: date
 *       - name: page
 *         in: query
 *         required: false
 *         description: return only the nth page of paginated results. Used always with page_size param.
 *         schema:
 *           type: number
 *       - name: page_size
 *         in: query
 *         required: false
 *         description: the number of records each result page contains. Used always with page param.
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *        description: The paginated list of the operations.
 *        content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/GenericList'
 *                 - properties:
 *                     operations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Operation'
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.get('', paymentController.getOperations);


/**
 * @swagger
 * /api/v1/operations/exchange-in:
 *   post:
 *     tags: [Operations]
 *     summary: Retrieve the transaction object to perform a exchangeIn.
 *     description: >
 *       Retrieve the transaction object to perform a exchangeIn and create the operation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           description: Address of the user that the marketplaces want to perform the exchangeIn.
 *           schema:
 *             type: object
 *             properties:
 *               userAddress:
 *                 type: string
 *                 example: '0xfaBC580e8250Bd31152E730138f0B7B827a2cDe6'
 *               tokens:
 *                 type: Number
 *                 example: 60
 *     responses:
 *       200:
 *        description: Returns the transaction object and the operation description.
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transferId:
 *                   type: string
 *                   format: uuid
 *                 transactionObject:
 *                   $ref: '#/components/schemas/TransactionObject'
 *                 operation:
 *                   $ref: '#/components/schemas/Operation'
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.post('/exchange-in', paymentController.exchangeIn);

/**
 * @swagger
 * /api/v1/operations/exchange-out:
 *   post:
 *     tags: [Operations]
 *     summary: Retrieve the transaction object to perform a exchangeOut.
 *     description: >
 *       Retrieve the transaction object to perform a exchangeOut.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           description: Address of the user that the marketplaces want to perform the exchangeIn.
 *           schema:
 *             type: object
 *             properties:
 *               senderAddress:
 *                 type: string
 *                 example: '0x3482ED36D95f3215fb0C4e717ea43F31CC6f61a6'
 *               marketplaceAddress:
 *                 type: string
 *                 example: '0x568EeaB5551a9158d75795fdd27A3154A466E09a'
 *     responses:
 *       200:
 *        description: Returns the transaction object and the operation description.
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transferId:
 *                   type: string
 *                   format: uuid
 *                 transactionObject:
 *                   $ref: '#/components/schemas/TransactionObject'
 *                 operation:
 *                   $ref: '#/components/schemas/Operation'
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.post('/exchange-out', paymentController.exchangeOut);


/**
 * @swagger
 * /api/v1/operations/clearing:
 *   post:
 *     tags: [Operations]
 *     summary: Retrieve the transaction object to start the Marketplace clearing operation.
 *     description: >
 *       Send all the tokens that the marketplaces owns from other marketplaces and send them to tre proper owner
 *       creating the proper clearing_in or clearing_out operation.
 *     responses:
 *       200:
 *        description: Returns the transaction object.
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transferId:
 *                   type: string
 *                   format: uuid
 *                 transactionObject:
 *                   $ref: '#/components/schemas/TransactionObject'
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.post('/clearing', paymentController.clearing);


/**
 * @swagger
 * /api/v1/operations/set-paid:
 *   post:
 *     tags: [Operations]
 *     summary: Generate the payment transaction object.
 *     description: >
 *       Pay fiat money to data providers or other marketplaces. It is required the transferId and the bank transfer
 *       code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           description: transferId and transactionObject needed to put ad operation as paid out.
 *           schema:
 *             $ref: '#/components/schemas/Pay'
 *     responses:
 *       200:
 *        description: Returns the setPaid transaction object.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                transferId:
 *                  type: string
 *                  format: uuid
 *                transactionObject:
 *                  $ref: '#/components/schemas/TransactionObject'
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.post('/set-paid', paymentController.setPaid);


/**
 * @swagger
 * /api/v1/operations/fee-payment:
 *   post:
 *     tags: [Operations]
 *     summary: Generate the fee payment transaction object.
 *     description: >
 *       Generates the transaction object needed to pay fee.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeePay'
 *     responses:
 *       200:
 *        description: Returns the feePayment transaction object and the operation description.
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transferId:
 *                   type: string
 *                   format: uuid
 *                 transactionObject:
 *                   $ref: '#/components/schemas/TransactionObject'
 *                 operation:
 *                   $ref: '#/components/schemas/Operation'
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.post('/fee-payment', paymentController.feePayment);

module.exports = router;
