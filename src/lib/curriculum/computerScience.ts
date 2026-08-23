import { buildChoices, numericChoices } from './genUtils'
import type { Generator, Subject } from './types'

const binaryConvert: Generator = {
  id: 'cs.binary',
  difficulty: 2,
  make: (rng, level) => {
    const max = level >= 2 ? 255 : 63
    const value = rng.int(5, max)
    const binary = value.toString(2).padStart(8, '0')
    const toDecimal = rng.bool(0.5)
    if (toDecimal) {
      const { choices, answerIndex } = numericChoices(rng, value, [
        parseInt([...binary].reverse().join(''), 2),
        value + 1,
        value * 2,
      ])
      return {
        prompt: `Convert the binary number ${binary} to denary.`,
        choices,
        answerIndex,
        explanation: `Add the place values where a 1 appears: ${[...binary]
          .map((bit, index) => (bit === '1' ? 2 ** (7 - index) : 0))
          .filter(Boolean)
          .join(' + ')} = ${value}.`,
        skill: 'binary to denary',
      }
    }
    const { choices, answerIndex } = buildChoices(
      rng,
      binary,
      [(value + 1).toString(2).padStart(8, '0'), (value * 2).toString(2).padStart(8, '0')],
      (index) => (value + index + 2).toString(2).padStart(8, '0'),
    )
    return {
      prompt: `Convert the denary number ${value} to 8-bit binary.`,
      choices,
      answerIndex,
      explanation: `Work down the place values 128, 64, 32, 16, 8, 4, 2, 1, subtracting where the value fits: ${value} = ${binary}.`,
      skill: 'denary to binary',
    }
  },
}

const COMPLEXITIES = [
  { code: 'A single loop over n items', answer: 'O(n)' },
  { code: 'A loop nested inside another loop over n items', answer: 'O(n²)' },
  { code: 'Binary search on a sorted array', answer: 'O(log n)' },
  { code: 'Returning the first element of an array', answer: 'O(1)' },
  { code: 'Merge sort on n items', answer: 'O(n log n)' },
  { code: 'Bubble sort worst case on n items', answer: 'O(n²)' },
  { code: 'Looking up a key in a well-distributed hash table', answer: 'O(1)' },
]

const complexity: Generator = {
  id: 'cs.complexity',
  difficulty: 3,
  bands: ['upper', 'tertiary'],
  make: (rng) => {
    const item = rng.pick(COMPLEXITIES)
    const { choices, answerIndex } = buildChoices(
      rng,
      item.answer,
      rng.shuffle(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'].filter((c) => c !== item.answer)),
    )
    return {
      prompt: `What is the time complexity of: ${item.code}?`,
      choices,
      answerIndex,
      explanation: `${item.answer}. Big-O describes how the work grows as n grows, ignoring constants and lower-order terms.`,
      skill: 'time complexity',
    }
  },
}

const booleanLogic: Generator = {
  id: 'cs.boolean',
  difficulty: 2,
  make: (rng) => {
    const a = rng.bool()
    const b = rng.bool()
    const op = rng.pick(['AND', 'OR', 'XOR', 'NAND'])
    const value =
      op === 'AND' ? a && b : op === 'OR' ? a || b : op === 'XOR' ? a !== b : !(a && b)
    const label = (flag: boolean) => (flag ? '1' : '0')
    const choices = ['0', '1']
    return {
      prompt: `A = ${label(a)}, B = ${label(b)}.  What is A ${op} B?`,
      choices,
      answerIndex: choices.indexOf(label(value)),
      explanation: `${op} outputs ${label(value)} here. ${
        op === 'AND'
          ? 'AND is 1 only when both inputs are 1.'
          : op === 'OR'
            ? 'OR is 1 when at least one input is 1.'
            : op === 'XOR'
              ? 'XOR is 1 only when the inputs differ.'
              : 'NAND is the inverse of AND, so it is 0 only when both inputs are 1.'
      }`,
      skill: 'logic gates',
    }
  },
}

const TRACE_ITEMS = [
  {
    code: 'x = 5\nfor i in range(3):\n    x = x + i',
    answer: '8',
    why: 'i takes 0, 1, 2, so x becomes 5 + 0 + 1 + 2 = 8. range(3) stops before 3.',
    distractors: ['11', '5', '15'],
  },
  {
    code: 'total = 0\nfor n in [4, 7, 2]:\n    if n > 3:\n        total = total + n',
    answer: '11',
    why: 'Only 4 and 7 pass the condition, so total is 11; 2 is skipped.',
    distractors: ['13', '4', '7'],
  },
  {
    code: 'a = 2\nwhile a < 20:\n    a = a * 3',
    answer: '54',
    why: 'a goes 2 → 6 → 18 → 54. The loop only stops after the value passes 20, so it overshoots.',
    distractors: ['18', '20', '27'],
  },
  {
    code: 'words = ["ab", "cde", "f"]\nn = 0\nfor w in words:\n    n = n + len(w)',
    answer: '6',
    why: 'Lengths 2 + 3 + 1 = 6.',
    distractors: ['3', '5', '9'],
  },
]

const traceCode: Generator = {
  id: 'cs.trace',
  difficulty: 3,
  make: (rng) => {
    const item = rng.pick(TRACE_ITEMS)
    const { choices, answerIndex } = buildChoices(rng, item.answer, item.distractors)
    return {
      prompt: `What is the final value after this code runs?\n\n${item.code}`,
      choices,
      answerIndex,
      explanation: item.why,
      skill: 'tracing code',
    }
  },
}

export const COMPUTER_SCIENCE: Subject = {
  id: 'computer-science',
  name: 'Computer Science',
  tagline: 'Algorithms, data, systems and networks',
  topics: [
    {
      id: 'algorithms',
      name: 'Algorithms & Complexity',
      summary: 'Searching, sorting and reasoning about efficiency.',
      bands: ['lower', 'upper', 'tertiary'],
      generators: [complexity, traceCode],
      concepts: [
        {
          id: 'algorithm',
          term: 'Algorithm',
          definition: 'A finite sequence of unambiguous steps that solves a problem.',
          detail:
            'It must terminate and be precise enough that two people following it get the same result.',
          example: 'A recipe, or the steps of long division.',
        },
        {
          id: 'linearsearch',
          term: 'Linear search',
          definition: 'Checking each item in turn until the target is found.',
          detail:
            'It needs no ordering and runs in O(n), which makes it the right choice for small or unsorted data.',
          example: 'Scanning an unsorted list of names.',
        },
        {
          id: 'binarysearch',
          term: 'Binary search',
          definition: 'Repeatedly halving a sorted list to locate a value.',
          detail:
            'It only works on sorted data, and its O(log n) cost means a million items take about twenty comparisons.',
          example: 'Finding a word in a dictionary.',
          misconception: 'Binary search works on any list as long as you know its length.',
        },
        {
          id: 'bubblesort',
          term: 'Bubble sort',
          definition: 'Repeatedly swapping adjacent out-of-order items until a pass makes no swaps.',
          detail:
            'Simple to write but O(n²), so it is a teaching algorithm rather than a practical one.',
          example: 'After the first pass, the largest value has reached the end.',
        },
        {
          id: 'mergesort',
          term: 'Merge sort',
          definition: 'Divide the list, sort each half, then merge the sorted halves.',
          detail:
            'Divide-and-conquer gives a reliable O(n log n) but needs extra memory for the merge.',
          example: 'Splitting eight items down to singles, then merging back up.',
        },
        {
          id: 'bigo',
          term: 'Big-O notation',
          definition: 'A description of how running time grows with input size.',
          detail:
            'It ignores constants and lower-order terms, so it compares scaling behaviour, not exact speed.',
          example: 'O(n²) becomes far worse than O(n log n) as n grows.',
          misconception: 'An O(n) algorithm is always faster than an O(n²) one on any input.',
        },
      ],
    },
    {
      id: 'datastructures',
      name: 'Data Structures',
      summary: 'Arrays, lists, stacks, queues and trees.',
      bands: ['upper', 'tertiary'],
      concepts: [
        {
          id: 'array',
          term: 'Array',
          definition: 'A fixed-size, contiguous block of elements of the same type.',
          detail:
            'Contiguity is what makes index access O(1) — the address is computed, not searched for.',
          example: 'scores[3] reaches the fourth element directly.',
        },
        {
          id: 'linkedlist',
          term: 'Linked list',
          definition: 'A chain of nodes where each holds data and a pointer to the next.',
          detail:
            'Insertion is cheap, but finding the nth item means walking the chain, so access is O(n).',
          example: 'Inserting mid-list only changes two pointers.',
          misconception: 'A linked list gives fast random access like an array.',
        },
        {
          id: 'stack',
          misconception:
            'A stack removes items in the order they were added.',
          term: 'Stack',
          definition: 'A last-in-first-out structure with push and pop operations.',
          detail:
            'Function calls use a stack, which is why infinite recursion causes a stack overflow.',
          example: 'The undo history in an editor.',
        },
        {
          id: 'queue',
          term: 'Queue',
          definition: 'A first-in-first-out structure with enqueue and dequeue.',
          detail:
            'Circular implementations reuse freed space at the front instead of shuffling every element.',
          example: 'A printer job queue.',
        },
        {
          id: 'hashtable',
          misconception:
            'A hash table guarantees O(1) lookup however full it gets.',
          term: 'Hash table',
          definition: 'A structure mapping keys to values using a hash function.',
          detail:
            'Average lookup is O(1); collisions are handled by chaining or probing and degrade performance when the table fills.',
          example: 'A dictionary keyed by username.',
        },
        {
          id: 'tree',
          term: 'Binary tree',
          definition: 'A hierarchy where each node has at most two children.',
          detail:
            'A balanced binary search tree keeps operations at O(log n); an unbalanced one degenerates to a list.',
          example: 'Inserting sorted data into a naive BST makes a chain.',
        },
      ],
    },
    {
      id: 'programming',
      name: 'Programming Fundamentals',
      summary: 'Variables, control flow, functions and debugging.',
      bands: ['middle', 'lower', 'upper'],
      generators: [traceCode],
      concepts: [
        {
          id: 'variable',
          misconception:
            'A local variable keeps its value after the function returns.',
          term: 'Variable',
          definition: 'A named location in memory holding a value that can change.',
          detail:
            'Its scope decides where it can be read, and local variables disappear when the function returns.',
          example: 'count = 0 before a loop increments it.',
        },
        {
          id: 'selection',
          term: 'Selection',
          definition: 'Choosing between paths with if / else if / else.',
          detail:
            'Conditions are evaluated in order, so the first true branch wins and the rest are skipped.',
          example: 'Grading a score into bands.',
        },
        {
          id: 'iteration',
          term: 'Iteration',
          definition: 'Repeating instructions with a loop.',
          detail:
            'Use a count-controlled loop when the number of repeats is known, and a condition-controlled loop when it is not.',
          example: 'for i in range(10) versus while not finished.',
          misconception: 'A while loop always runs at least once.',
        },
        {
          id: 'function',
          term: 'Function',
          definition: 'A named, reusable block of code that may take parameters and return a value.',
          detail:
            'Functions cut duplication and let each part be tested on its own.',
          example: 'def area(w, h): return w * h',
        },
        {
          id: 'datatypes',
          term: 'Data types',
          definition: 'Categories such as integer, real, Boolean, character and string.',
          detail:
            'The type decides both the storage used and the operations allowed — "5" + "5" concatenates while 5 + 5 adds.',
          example: 'Casting input to int before arithmetic.',
        },
        {
          id: 'debugging',
          misconception:
            'A program that runs without crashing contains no errors.',
          term: 'Errors and debugging',
          definition: 'Syntax, runtime and logic errors, and how to find them.',
          detail:
            'Logic errors are the hardest because the program runs happily and simply gives the wrong answer.',
          example: 'Using < instead of <= in a loop condition.',
        },
      ],
    },
    {
      id: 'datarep',
      name: 'Binary & Data Representation',
      summary: 'How numbers, text, images and sound are stored.',
      bands: ['lower', 'upper'],
      generators: [binaryConvert],
      concepts: [
        {
          id: 'binary',
          term: 'Binary',
          definition: 'Base-2 representation using only 0 and 1.',
          detail:
            'Two states map cleanly onto voltage levels, which is why hardware uses base 2 rather than base 10.',
          example: '1011 is 8 + 2 + 1 = 11.',
        },
        {
          id: 'hex',
          misconception:
            'Hexadecimal is used because computers store data in base 16.',
          term: 'Hexadecimal',
          definition: 'Base-16 notation used as shorthand for binary.',
          detail:
            'Each hex digit maps to exactly four bits, making long binary strings readable and less error-prone.',
          example: 'FF is 11111111, or 255.',
        },
        {
          id: 'characterset',
          term: 'Character sets',
          definition: 'Codes mapping characters to binary values, such as ASCII and Unicode.',
          detail:
            'ASCII’s 7 bits cover only 128 characters, so Unicode was needed for the world’s scripts and emoji.',
          example: 'Capital A is 65 in ASCII.',
        },
        {
          id: 'imagerep',
          term: 'Image representation',
          definition: 'Bitmap images stored as a grid of pixels with a colour depth.',
          detail:
            'File size ≈ width × height × colour depth, so doubling resolution roughly quadruples the size.',
          example: '24-bit colour gives about 16.7 million colours.',
          misconception: 'Enlarging a bitmap adds detail to it.',
        },
        {
          id: 'soundrep',
          term: 'Sound representation',
          definition: 'Analogue sound sampled at intervals and stored as numbers.',
          detail:
            'Higher sample rate and bit depth improve fidelity and increase file size proportionally.',
          example: 'CD audio samples 44,100 times per second.',
        },
        {
          id: 'compression',
          misconception:
            'Lossy compression can be reversed to recover the original file exactly.',
          term: 'Compression',
          definition: 'Reducing file size, either losslessly or lossily.',
          detail:
            'Lossless (PNG, ZIP) reconstructs the original exactly; lossy (JPEG, MP3) discards detail permanently.',
          example: 'MP3 removes sounds masked by louder ones.',
        },
      ],
    },
    {
      id: 'architecture',
      name: 'Computer Architecture',
      summary: 'The CPU, memory, storage and the fetch–execute cycle.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'vonneumann',
          term: 'Von Neumann architecture',
          definition: 'A design where instructions and data share the same memory.',
          detail:
            'One shared bus makes it simple but creates the bottleneck that caches are designed to relieve.',
          example: 'Almost all general-purpose computers use it.',
        },
        {
          id: 'fetchexecute',
          term: 'Fetch–decode–execute cycle',
          definition: 'The repeating cycle by which the CPU runs instructions.',
          detail:
            'The program counter holds the next address, the MAR and MDR move it, and the decoded instruction is then carried out.',
          example: 'A 3 GHz CPU repeats this billions of times a second.',
        },
        {
          id: 'cpuperformance',
          term: 'CPU performance factors',
          definition: 'Clock speed, number of cores and cache size.',
          detail:
            'More cores only help software written to run in parallel, so clock speed still matters for single-threaded work.',
          example: 'A quad-core chip running a single-threaded game.',
          misconception: 'Doubling the cores always doubles the speed.',
        },
        {
          id: 'ramrom',
          misconception:
            'RAM keeps its contents when the computer is switched off.',
          term: 'RAM and ROM',
          definition: 'Volatile working memory, and non-volatile start-up memory.',
          detail:
            'RAM loses its contents when power is removed; ROM keeps the boot instructions safe.',
          example: 'The BIOS lives in ROM.',
        },
        {
          id: 'cache',
          misconception:
            'A bigger cache always matters more than a faster clock speed.',
          term: 'Cache',
          definition: 'Small, very fast memory close to the CPU.',
          detail:
            'It stores recently used instructions and data so the CPU stalls less often waiting for RAM.',
          example: 'L1 cache is smallest and fastest.',
        },
        {
          id: 'secondarystorage',
          term: 'Secondary storage',
          definition: 'Non-volatile long-term storage such as HDDs, SSDs and optical discs.',
          detail:
            'SSDs have no moving parts, so they are faster and more robust but cost more per gigabyte.',
          example: 'A laptop booting from an SSD.',
        },
      ],
    },
    {
      id: 'networks',
      name: 'Networks & the Internet',
      summary: 'Topologies, protocols and how data crosses the internet.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'lanwan',
          term: 'LAN and WAN',
          definition: 'A network over a small site, versus one spanning large distances.',
          detail:
            'A LAN’s infrastructure is usually owned by the organisation; a WAN relies on third-party links.',
          example: 'A school network versus the internet.',
        },
        {
          id: 'packet',
          term: 'Packet switching',
          definition: 'Splitting data into packets routed independently across a network.',
          detail:
            'Packets can take different routes and arrive out of order, so each carries a sequence number for reassembly.',
          example: 'A video stream arriving as thousands of packets.',
          misconception: 'All packets in a transfer follow the same route.',
        },
        {
          id: 'protocol',
          misconception:
            'A single protocol handles the whole journey of data across the internet.',
          term: 'Protocol',
          definition: 'An agreed set of rules for communication between devices.',
          detail:
            'Layering means each protocol handles one job — HTTP content, TCP reliability, IP addressing.',
          example: 'HTTPS, TCP/IP, SMTP.',
        },
        {
          id: 'ipaddress',
          term: 'IP address',
          definition: 'A numeric address identifying a device on a network.',
          detail:
            'IPv4’s four-billion address space ran short, which is what drove IPv6 adoption.',
          example: '192.168.0.14 on a home network.',
        },
        {
          id: 'dns',
          misconception:
            'Every DNS lookup travels all the way to a root server.',
          term: 'DNS',
          definition: 'The system translating domain names into IP addresses.',
          detail:
            'Resolution is hierarchical and cached, so most lookups never reach a root server.',
          example: 'Turning example.com into 93.184.216.34.',
        },
        {
          id: 'clientserver',
          term: 'Client–server and peer-to-peer',
          definition: 'Two models for sharing resources across a network.',
          detail:
            'Client–server centralises control and backup; peer-to-peer scales cheaply but is harder to secure.',
          example: 'A web server versus BitTorrent.',
        },
      ],
    },
    {
      id: 'databases',
      name: 'Databases & SQL',
      summary: 'Relational design, keys and querying.',
      bands: ['upper', 'tertiary'],
      concepts: [
        {
          id: 'relational',
          term: 'Relational database',
          definition: 'Data stored in linked tables of rows and columns.',
          detail:
            'Splitting data across related tables removes duplication, so a change is made in exactly one place.',
          example: 'Students and Courses linked by an enrolment table.',
        },
        {
          id: 'primarykey',
          misconception:
            'A primary key may be left empty as long as the row is unique in other ways.',
          term: 'Primary key',
          definition: 'A field uniquely identifying each record in a table.',
          detail:
            'It cannot be null or duplicated, which is what lets other tables reference the row reliably.',
          example: 'StudentID in a Students table.',
        },
        {
          id: 'foreignkey',
          term: 'Foreign key',
          definition: 'A field referencing the primary key of another table.',
          detail:
            'It enforces referential integrity, blocking records that point at rows which do not exist.',
          example: 'CourseID inside an Enrolments table.',
          misconception: 'A foreign key must have the same name as the key it references.',
        },
        {
          id: 'sqlselect',
          term: 'SELECT query',
          definition: 'The SQL statement retrieving rows from one or more tables.',
          detail:
            'WHERE filters rows before grouping; HAVING filters after aggregation.',
          example: 'SELECT name FROM students WHERE year = 11;',
        },
        {
          id: 'normalisation',
          misconception:
            'Normalisation always makes queries faster.',
          term: 'Normalisation',
          definition: 'Structuring tables to reduce redundancy and anomalies.',
          detail:
            'Each step removes a class of duplication, at the cost of needing more joins when querying.',
          example: 'Moving repeated address data into its own table.',
        },
        {
          id: 'transaction',
          term: 'Transactions and ACID',
          definition: 'Grouped operations that succeed or fail as a unit.',
          detail:
            'Atomicity, consistency, isolation and durability keep data valid even if the system crashes mid-write.',
          example: 'A bank transfer debiting and crediting together.',
        },
      ],
    },
    {
      id: 'security',
      name: 'Cyber Security',
      summary: 'Threats, attacks and defensive measures.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'malware',
          misconception:
            'A virus and a worm spread in exactly the same way.',
          term: 'Malware',
          definition: 'Software written to damage or gain unauthorised access to a system.',
          detail:
            'Viruses need a host file, worms spread on their own, and ransomware encrypts data for payment.',
          example: 'A worm spreading across a network without user action.',
        },
        {
          id: 'phishing',
          term: 'Phishing',
          definition: 'Fraudulent messages tricking users into revealing credentials.',
          detail:
            'It attacks the person rather than the system, which is why training matters as much as software.',
          example: 'A fake bank email linking to a cloned login page.',
        },
        {
          id: 'socialengineering',
          term: 'Social engineering',
          definition: 'Manipulating people into breaking security procedures.',
          detail:
            'Attackers exploit authority, urgency and helpfulness — the same instincts that make workplaces function.',
          example: 'Someone phoning IT posing as a senior manager.',
          misconception: 'Strong technical defences make an organisation secure on their own.',
        },
        {
          id: 'sqlinjection',
          term: 'SQL injection',
          definition: 'Inserting malicious SQL through an input field.',
          detail:
            'It works when input is concatenated into a query; parameterised queries stop it by separating code from data.',
          example: "Entering ' OR '1'='1 into a login box.",
        },
        {
          id: 'encryption',
          misconception:
            'Encrypted data cannot be stolen.',
          term: 'Encryption',
          definition: 'Encoding data so only holders of the key can read it.',
          detail:
            'Encryption protects data in transit and at rest, but does not stop it being deleted or a system being breached.',
          example: 'HTTPS protecting a form submission.',
        },
        {
          id: 'defences',
          term: 'Defensive measures',
          definition: 'Firewalls, access control, penetration testing and backups.',
          detail:
            'Layered defence assumes any single control can fail, so backups remain the last line against ransomware.',
          example: 'Least-privilege accounts limiting the blast radius.',
        },
      ],
    },
    {
      id: 'logic',
      name: 'Boolean Logic',
      summary: 'Logic gates, truth tables and expressions.',
      bands: ['lower', 'upper'],
      generators: [booleanLogic],
      concepts: [
        {
          id: 'andgate',
          term: 'AND gate',
          definition: 'Outputs 1 only when every input is 1.',
          detail: 'Written A · B or A ∧ B in Boolean algebra.',
          example: 'A safety interlock needing two switches closed.',
        },
        {
          id: 'orgate',
          term: 'OR gate',
          definition: 'Outputs 1 when at least one input is 1.',
          detail: 'Written A + B; it is inclusive, so 1 OR 1 is also 1.',
          example: 'An alarm triggered by either sensor.',
          misconception: 'OR means exactly one input is 1.',
        },
        {
          id: 'notgate',
          misconception:
            'A NOT gate takes two inputs like the other gates.',
          term: 'NOT gate',
          definition: 'Inverts a single input.',
          detail: 'The only single-input gate, written Ā.',
          example: 'Turning an active-low signal into active-high.',
        },
        {
          id: 'xorgate',
          term: 'XOR gate',
          definition: 'Outputs 1 only when the inputs differ.',
          detail: 'Central to binary addition, where it produces the sum bit of a half adder.',
          example: '1 XOR 1 gives 0.',
        },
        {
          id: 'truthtable',
          misconception:
            'A three-input truth table needs six rows.',
          term: 'Truth table',
          definition: 'A table of every input combination and the resulting output.',
          detail: 'n inputs need 2ⁿ rows, so a three-input table has eight.',
          example: 'A two-input AND table has four rows.',
        },
        {
          id: 'booleanexpr',
          term: 'Boolean expressions',
          definition: 'Algebraic descriptions of a logic circuit.',
          detail:
            'Simplifying with Boolean identities reduces the number of physical gates needed.',
          example: 'A · (A + B) simplifies to A.',
        },
      ],
    },
  ],
}
