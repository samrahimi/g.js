import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import g from '../g.js'

const stdin = readline.createInterface({ input, output });

//sample output from a general image recognition model
//as long as it has "name" and "value" fields any format will do
const concepts= [
          {
            "id": "ai_WBQfVV0p",
            "name": "city",
            "value": 0.997239,
            "app_id": "main"
          },
          {
            "id": "ai_SXjP6RMJ",
            "name": "aerial",
            "value": 0.994892,
            "app_id": "main"
          },
          {
            "id": "ai_VRmbGVWh",
            "name": "travel",
            "value": 0.9902485,
            "app_id": "main"
          },
          {
            "id": "ai_068RtVqV",
            "name": "cityscape",
            "value": 0.9890009,
            "app_id": "main"
          },
          {
            "id": "ai_FWCjC8jZ",
            "name": "architecture",
            "value": 0.98424053,
            "app_id": "main"
          },
          {
            "id": "ai_jvwJ2H7f",
            "name": "sight",
            "value": 0.98019296,
            "app_id": "main"
          },
          {
            "id": "ai_m8rrtkhG",
            "name": "town",
            "value": 0.97607625,
            "app_id": "main"
          },
          {
            "id": "ai_JMZ5xhBD",
            "name": "skyline",
            "value": 0.9706905,
            "app_id": "main"
          },
          {
            "id": "ai_786Zr311",
            "name": "no person",
            "value": 0.96622044,
            "app_id": "main"
          },
          {
            "id": "ai_CpFBRWzD",
            "name": "urban",
            "value": 0.96236306,
            "app_id": "main"
          },
          {
            "id": "ai_FG5057gF",
            "name": "panorama",
            "value": 0.95564336,
            "app_id": "main"
          },
          {
            "id": "ai_9Dcdh0PK",
            "name": "house",
            "value": 0.95115113,
            "app_id": "main"
          },
          {
            "id": "ai_ZxjFqlQz",
            "name": "roof",
            "value": 0.9416117,
            "app_id": "main"
          },
          {
            "id": "ai_MTvKbKJv",
            "name": "landscape",
            "value": 0.9182175,
            "app_id": "main"
          },
          {
            "id": "ai_rsX6XWc2",
            "name": "building",
            "value": 0.91637516,
            "app_id": "main"
          },
          {
            "id": "ai_Zmhsv0Ch",
            "name": "outdoors",
            "value": 0.9115347,
            "app_id": "main"
          },
          {
            "id": "ai_5mnDr9Lh",
            "name": "high",
            "value": 0.90838337,
            "app_id": "main"
          },
          {
            "id": "ai_tr0MBp64",
            "name": "traffic",
            "value": 0.8954138,
            "app_id": "main"
          },
          {
            "id": "ai_7XmqqxRp",
            "name": "suburb",
            "value": 0.89255303,
            "app_id": "main"
          },
          {
            "id": "ai_Cm2lmhp0",
            "name": "landmark",
            "value": 0.8797074,
            "app_id": "main"
          }
]
   


const start = Date.now()
const description = await g.fromTemplate("image_comprehension", {concepts: concepts})
const end = Date.now()

console.log(description)
console.log("Inference completed in "+(end - start).toString()+"ms")

