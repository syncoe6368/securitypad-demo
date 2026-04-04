// Default Foundry project template for SecurityPad IDE
// Loaded on first visit

export interface ProjectFile {
  path: string;
  content: string;
}

export const DEFAULT_PROJECT: ProjectFile[] = [
  {
    path: 'contracts/StakingVault.sol',
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingVault
 * @notice A secure staking vault with time-locked rewards
 * @dev Uses Checks-Effects-Interactions pattern
 */
contract StakingVault is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken;

    uint256 public rewardRate;
    uint256 public totalStaked;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public stakeTimestamp;

    uint256 public constant MIN_STAKE_DURATION = 7 days;
    uint256 public constant EARLY_WITHDRAW_PENALTY = 10; // 10%

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + (
            (block.timestamp - lastUpdateTime) * rewardRate * 1e18 / totalStaked
        );
    }

    function earned(address account) public view returns (uint256) {
        return (
            balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalStaked += amount;
        balances[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        stakingToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Apply early withdrawal penalty
        if (block.timestamp < stakeTimestamp[msg.sender] + MIN_STAKE_DURATION) {
            uint256 penalty = amount * EARLY_WITHDRAW_PENALTY / 100;
            stakingToken.transfer(owner(), penalty);
            amount -= penalty;
        }

        totalStaked -= amount;
        balances[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            stakingToken.transfer(msg.sender, reward);
            emit RewardsClaimed(msg.sender, reward);
        }
    }

    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }
}
`,
  },
  {
    path: 'contracts/interfaces/IStaking.sol',
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStaking {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getReward() external;
    function earned(address account) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}
`,
  },
  {
    path: 'contracts/libraries/Math.sol',
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Math {
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
`,
  },
  {
    path: 'test/StakingVault.t.sol',
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/StakingVault.sol";
import "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract StakingVaultTest is Test {
    StakingVault vault;
    ERC20Mock token;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        token = new ERC20Mock();
        vault = new StakingVault(address(token));
        token.mint(alice, 1000e18);
        token.mint(bob, 1000e18);
    }

    function test_Stake() public {
        vm.startPrank(alice);
        token.approve(address(vault), 100e18);
        vault.stake(100e18);
        assertEq(vault.balanceOf(alice), 100e18);
        vm.stopPrank();
    }

    function test_Withdraw() public {
        vm.startPrank(alice);
        token.approve(address(vault), 100e18);
        vault.stake(100e18);
        vm.warp(block.timestamp + 8 days);
        vault.withdraw(100e18);
        assertEq(vault.balanceOf(alice), 0);
        vm.stopPrank();
    }

    function test_EarlyWithdrawPenalty() public {
        vm.startPrank(alice);
        token.approve(address(vault), 100e18);
        vault.stake(100e18);
        // Withdraw before minimum duration
        vault.withdraw(100e18);
        // Should have penalty applied
        assertLt(token.balanceOf(alice), 1000e18);
        vm.stopPrank();
    }

    function testFuzz_Stake(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 1000e18);
        vm.startPrank(alice);
        token.approve(address(vault), amount);
        vault.stake(amount);
        assertEq(vault.balanceOf(alice), amount);
        vm.stopPrank();
    }
}
`,
  },
  {
    path: 'scripts/Deploy.s.sol',
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/StakingVault.sol";

contract DeployStakingVault is Script {
    function run() external {
        address stakingToken = vm.envAddress("STAKING_TOKEN");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        new StakingVault(stakingToken);
        vm.stopBroadcast();
    }
}
`,
  },
  {
    path: 'foundry.toml',
    content: `[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc = "0.8.20"

[profile.default.fuzz]
runs = 256

[fmt]
line_length = 120
tab_width = 4
`,
  },
  {
    path: 'README.md',
    content: `# StakingVault Foundry Project

A secure staking vault smart contract project built with Foundry.

## Setup

\`\`\`bash
forge install
forge build
forge test
\`\`\`

## Security

Audit this project with [SecurityPad](https://securitypad.dev) for AI-powered vulnerability detection.
`,
  },
];
