import {parseSettings} from "../../../src/lib/utils/parseSettings"
import { expect } from "chai"

const testData = "[{\"type\": 1, \"user\": true, \"index\": 1, \"default\": true, \"description\": \"test1\"}, {\"type\": 2, \"user\": 10, \"index\": 2, \"ticker\": 1, \"default\": 10, \"enabled\": true, \"lowerLimit\": 1, \"upperLimit\": 100, \"description\": \"test2\"}, {\"type\": 3, \"user\": {\"lower\": 10, \"upper\": 50}, \"index\": 3, \"ticker\": 2, \"default\": {\"lower\": 10, \"upper\": 50}, \"enabled\": true, \"lowerLimit\": 1, \"upperLimit\": 100, \"description\": \"test3\"}, {\"type\": 3, \"user\": {\"lower\": 3, \"upper\": 5}, \"index\": 4, \"ticker\": 2, \"default\": {\"lower\": 3, \"upper\": 5}, \"enabled\": false, \"lowerLimit\": 1, \"upperLimit\": 100, \"description\": \"test4\"}]"
describe("Test parseSettings", ()=>{
    it("Should succesfully parse the settings", ()=>{
        const res = parseSettings(testData)
        expect(res.length).to.be.equal(4)
    })
})