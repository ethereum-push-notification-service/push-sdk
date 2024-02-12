import * as helpers from "../../../src/lib/payloads/helpers"
import * as encHelpers from "../../../src/lib/payloads/encHelpers"
import { ENV } from "../../../src/lib/constants"
import { NOTIFICATION_TYPE } from "../../../src/lib/payloads"
import * as testData from "./testData"
import { expect } from "chai"

describe("payload helpers", ()=>{
    describe("getRecipients", async()=>{
        it("Should return the recipient with the secret for targetted", async() =>{
            const recipient = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.TARGETTED,
                channel: testData.CHANNEL,
                secretType: 'PGPV1',
                recipients: testData.TARGETED_RECIPIENT

            })
            console.log(recipient)
           expect(recipient).not.null;
           expect(recipient).to.have.keys(['_recipients', 'secret'])
        })

        it("Should return the recipient with the secret for subset", async() =>{
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.SUBSET,
                channel: testData.CHANNEL,
                secretType: 'PGPV1',
                recipients: testData.SUBSET_RECIPIENT

            })
           expect(recipients).not.null;
           expect(recipients).to.have.keys(['_recipients', 'secret'])
        })

        it("Should return the recipient without the secret for targeted", async() =>{
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.TARGETTED,
                channel: testData.CHANNEL,
                recipients: testData.TARGETED_RECIPIENT

            })
           expect(recipients).not.null;
           expect(recipients).to.have.keys(['_recipients'])
        })

        it("Should return the recipient without the secret for subset", async() =>{
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.SUBSET,
                channel: testData.CHANNEL,
                recipients: testData.SUBSET_RECIPIENT

            })
           expect(recipients).not.null;
           expect(recipients).to.have.keys(['_recipients'])
        })
        it("Should return the recipient without the secret for broadcast", async() =>{
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.BROADCAST,
                channel: testData.CHANNEL,

            })
           expect(recipients).not.null;
           expect(recipients).to.have.keys(['_recipients'])
        })
    });

    describe("getPayloadForAPIInput", async ()=> {
        it("Should return the payload with encrypted data for targeted type", async() => {
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.TARGETTED,
                channel: testData.CHANNEL,
                secretType: 'PGPV1',
                recipients: testData.TARGETED_RECIPIENT
            })

            const payload = helpers.getPayloadForAPIInput(
                testData.TEST_ENC_RAW_PAYLOAD,
                recipients._recipients,
                recipients.secret
            )

            expect(payload).not.null

        })

        it("Should return the payload with encrypted data for subset type", async() => {
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.SUBSET,
                channel: testData.CHANNEL,
                secretType: 'PGPV1',
                recipients: testData.SUBSET_RECIPIENT
            })

            const payload = helpers.getPayloadForAPIInput(
                testData.TEST_ENC_RAW_PAYLOAD,
                recipients._recipients,
                recipients.secret
            )

            console.log(payload)

            expect(payload).not.null

        })

        it("Should return the payload with non-encrypted data for subset type", async() => {
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.SUBSET,
                channel: testData.CHANNEL,
                recipients: testData.SUBSET_RECIPIENT
            })
            console.log(recipients)

            const payload = helpers.getPayloadForAPIInput(
                testData.TEST_RAW_PAYLOAD,
                recipients._recipients,
                recipients.secret
            )

            expect(payload).not.null

        })

        it("Should return the payload with non-encrypted data for targeted type", async() => {
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.TARGETTED,
                channel: testData.CHANNEL,
                recipients: testData.TARGETED_RECIPIENT
            })
            console.log(recipients)

            const payload = helpers.getPayloadForAPIInput(
                testData.TEST_RAW_PAYLOAD,
                recipients._recipients,
                recipients.secret
            )

            expect(payload).not.null

        })

        it("Should return the payload with non-encrypted data for broadcast type", async() => {
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.BROADCAST,
                channel: testData.CHANNEL,
            })

            const payload = helpers.getPayloadForAPIInput(
                testData.TEST_RAW_PAYLOAD,
                recipients._recipients,
                recipients.secret
            )

            expect(payload).not.null

        })

        it("Should return the payload with encrypted data for broadcast type", async() => {
            const recipients = await helpers.getRecipients({
                env: ENV.DEV,
                notificationType: NOTIFICATION_TYPE.BROADCAST,
                channel: testData.CHANNEL,
                secretType: 'PGPV1',
            })
            console.log(recipients)
        })
    })
})