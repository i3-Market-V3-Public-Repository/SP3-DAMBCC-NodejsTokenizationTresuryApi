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
 *   components:
 *     schemas:
 *       GenericList:
 *         required:
 *          - count
 *          - page
 *          - page_size
 *          - total_pages
 *         properties:
 *          count:
 *            type: Number
 *            description: The total number of results matching the user's query.
 *            example: 50
 *          page:
 *            type: Number
 *            description: The number of the current page of paginated results.
 *            example: 1
 *          page_size:
 *            type: Number
 *            description: The number of results contained in each page.
 *            example: 10
 *          total_pages:
 *            type: Number
 *            description: The total number of pages.
 *            example: 5
 *       TransactionObject:
 *         type: object
 *         required:
 *           - chainId
 *           - nonce
 *           - gasLimit
 *           - gasPrice
 *           - to
 *           - from
 *           - data
 *         properties:
 *           chainId:
 *             type: Number
 *             description: id of the chain where the transaction will be send.
 *             example: 1
 *           nonce:
 *             type: Number
 *             description: nonce of the transaction
 *             example: 1
 *           gasLimit:
 *             type: Number
 *             description: maximum gas to spend on the transaction.
 *             example: 6721975
 *           gasPrice:
 *             type: Number
 *             description: price in gwei willing to pay for the gas.
 *             example: 120
 *           to:
 *             type: string
 *             description: receiver of the transaction.
 *             example: '0x5780262041318FD9fc8E345F665bEc7684E15C75'
 *           from:
 *             type: string
 *             description: sender of the transaction.
 *             example: '0xb3a0ED21c54196E4B446D79b7925766aa86BC196'
 *           data:
 *             type: string
 *             description: the transaction parameter values.
 *             example: '0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000'
 *       Operation:
 *         type: object
 *         required:
 *           - transferId
 *           - type
 *           - status
 *           - user
 *           - date
 *         properties:
 *           transferId:
 *             type: string
 *             format: uuid
 *             description: auto-generated id of the transfer.
 *           type:
 *             type: string
 *             enum: [exchange_in, exchange_out, clearing]
 *           status:
 *             type: string
 *             enum: [open, closed, in_progress]
 *           user:
 *             type: string
 *             example: '0xb794f5ea0ba39494ce839613fffba74279579268'
 *             description: user address.
 *           date:
 *             type: string
 *             format: date-time
 *       Pay:
 *         type: object
 *         required:
 *           - transferId
 *           - transferCode
 *         properties:
 *           transferId:
 *             type: string
 *             format: uuid
 *             description: auto-generated id of the transfer.
 *           transferCode:
 *             type: string
 *             example: 'ES2703926222'
 *             description: bank transfer id
 *       Error:
 *         type: object
 *         required:
 *           - status
 *           - message
 *         properties:
 *           status:
 *             type: string
 *             example: error
 *           message:
 *             type: string
 *             example: Invalid address
 */


/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management API for the integration of Marketplaces.
 */


/**
 * @swagger
 * /api/v1/payments/operations:
 *   get:
 *     tags: [Payments]
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
 *         description: Filter by operation status. Allowed values "open", "closed" and "in_progress".
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
router.get('/operations', paymentController.getOperations);


/**
 * @swagger
 * /api/v1/payments/exchange-in:
 *   post:
 *     tags: [Payments]
 *     summary: Retrieve the transaction object to perform a exchangeIn and create the operation.
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
 *                 example: '0xb5F3c73813B63336D8A3434B46f0164F57662f71'
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
 * /api/v1/payments/clearing:
 *   post:
 *     tags: [Payments]
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
 * /api/v1/payments/payment:
 *   post:
 *     tags: [Payments]
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
router.post('/payment', paymentController.setPaid);

module.exports = router;