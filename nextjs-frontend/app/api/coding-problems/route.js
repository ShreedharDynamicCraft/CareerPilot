import { NextResponse } from 'next/server';

// Mock database of coding problems
// In a real application, this would come from a database
const problems = [
  {
    id: "1",
    title: "Two Sum",
    topic: "arrays",
    difficulty: "easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      }
    ],
    starterCode: `#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};`,
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1]
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2]
      },
      {
        input: { nums: [3, 3], target: 6 },
        expectedOutput: [0, 1]
      }
    ],
    expectedComplexity: { time: "O(n)", space: "O(n)" },
    companies: ["google", "apple", "amazon", "microsoft", "meta"]
  },
  {
    id: "2",
    title: "Valid Parentheses",
    topic: "strings",
    difficulty: "easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    examples: [
      {
        input: "s = \"()\"",
        output: "true"
      },
      {
        input: "s = \"()[]{}\"",
        output: "true"
      },
      {
        input: "s = \"(]\"",
        output: "false"
      }
    ],
    starterCode: `#include <string>\n\nclass Solution {\npublic:\n    bool isValid(std::string s) {\n        // Your code here\n        \n    }\n};`,
    testCases: [
      {
        input: { s: "()" },
        expectedOutput: true
      },
      {
        input: { s: "()[]{}" },
        expectedOutput: true
      },
      {
        input: { s: "(]" },
        expectedOutput: false
      },
      {
        input: { s: "([)]" },
        expectedOutput: false
      },
      {
        input: { s: "{[]}" },
        expectedOutput: true
      }
    ],
    expectedComplexity: { time: "O(n)", space: "O(n)" },
    companies: ["google", "amazon", "microsoft"]
  },
  {
    id: "3",
    title: "Reverse Linked List",
    topic: "linked-list",
    difficulty: "easy",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: [
      "The number of nodes in the list is the range [0, 5000]",
      "-5000 <= Node.val <= 5000"
    ],
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]"
      },
      {
        input: "head = [1,2]",
        output: "[2,1]"
      },
      {
        input: "head = []",
        output: "[]"
      }
    ],
    starterCode: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n        \n    }\n};`,
    testCases: [
      {
        input: { head: [1, 2, 3, 4, 5] },
        expectedOutput: [5, 4, 3, 2, 1]
      },
      {
        input: { head: [1, 2] },
        expectedOutput: [2, 1]
      },
      {
        input: { head: [] },
        expectedOutput: []
      }
    ],
    expectedComplexity: { time: "O(n)", space: "O(1)" },
    companies: ["amazon", "microsoft", "meta", "apple"]
  },
  {
    id: "4",
    title: "Maximum Subarray",
    topic: "arrays",
    difficulty: "medium",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        input: "nums = [1]",
        output: "1"
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23"
      }
    ],
    starterCode: `#include <vector>\n\nclass Solution {\npublic:\n    int maxSubArray(std::vector<int>& nums) {\n        // Your code here\n        \n    }\n};`,
    testCases: [
      {
        input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        expectedOutput: 6
      },
      {
        input: { nums: [1] },
        expectedOutput: 1
      },
      {
        input: { nums: [5, 4, -1, 7, 8] },
        expectedOutput: 23
      }
    ],
    expectedComplexity: { time: "O(n)", space: "O(1)" },
    companies: ["amazon", "microsoft", "apple", "google"]
  },
  {
    id: "5",
    title: "Binary Tree Level Order Traversal",
    topic: "trees",
    difficulty: "medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000]",
      "-1000 <= Node.val <= 1000"
    ],
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]"
      },
      {
        input: "root = [1]",
        output: "[[1]]"
      },
      {
        input: "root = []",
        output: "[]"
      }
    ],
    starterCode: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\n#include <vector>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> levelOrder(TreeNode* root) {\n        // Your code here\n        \n    }\n};`,
    testCases: [
      {
        input: { root: [3, 9, 20, null, null, 15, 7] },
        expectedOutput: [[3], [9, 20], [15, 7]]
      },
      {
        input: { root: [1] },
        expectedOutput: [[1]]
      },
      {
        input: { root: [] },
        expectedOutput: []
      }
    ],
    expectedComplexity: { time: "O(n)", space: "O(n)" },
    companies: ["amazon", "microsoft", "meta", "google"]
  }
];

export async function POST(request) {
  try {
    const { type, language, topic, difficulty, company } = await request.json();
    
    // Filter problems based on criteria
    let filteredProblems = [...problems];
    
    if (topic && topic !== 'all') {
      filteredProblems = filteredProblems.filter(p => p.topic === topic);
    }
    
    if (difficulty && difficulty !== 'all') {
      filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
    }
    
    if (company && company !== 'all') {
      filteredProblems = filteredProblems.filter(p => 
        p.companies && p.companies.includes(company)
      );
    }
    
    // If no problems match the criteria, return a subset of all problems
    if (filteredProblems.length === 0) {
      filteredProblems = problems.slice(0, 3);
    }
    
    // Randomly select one problem
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    const selectedProblem = filteredProblems[randomIndex];
    
    return NextResponse.json({ problem: selectedProblem });
  } catch (error) {
    console.error('Error processing coding problem request:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve coding problem' },
      { status: 500 }
    );
  }
}
