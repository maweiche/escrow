import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { start } from "solana-bankrun";
import { Escrow } from "../target/types/escrow";
import { startAnchor } from "solana-bankrun";
import { SystemProgram, PublicKey, Keypair, Transaction , MemcmpFilter, GetProgramAccountsConfig, Connection, SYSVAR_INSTRUCTIONS_PUBKEY, sendAndConfirmTransaction} from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, createInitializeMint2Instruction, createMintToInstruction, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { expect } from "chai";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const connection = new Connection('http://localhost:8899', 'confirmed');
  // const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const program = anchor.workspace.Escrow as Program<Escrow>;

  const wallet = anchor.Wallet.local();
  const wallet_a = wallet;
  const wallet_b = Keypair.generate();

  const mint_a = Keypair.generate();
  const mint_b = Keypair.generate();

  const wallet_a_ata = getAssociatedTokenAddressSync(mint_a.publicKey, wallet_a.publicKey);
  const wallet_aB_ata = getAssociatedTokenAddressSync(mint_b.publicKey, wallet_a.publicKey);

  const wallet_b_ata = getAssociatedTokenAddressSync(mint_a.publicKey, wallet_b.publicKey);
  const wallet_bB_ata = getAssociatedTokenAddressSync(mint_b.publicKey, wallet_b.publicKey);
  const random_number = Math.floor(Math.random() * 1000000);
  const seed = new anchor.BN(2);
  const escrow = PublicKey.findProgramAddressSync([Buffer.from("escrow"), wallet_a.publicKey.toBuffer(), seed.toBuffer("le", 8)], program.programId)[0];
  const escrowAta = getAssociatedTokenAddressSync(mint_a.publicKey, escrow, true);

  // it("Setup Mint and Accounts", async () => {
  //   const context = await startAnchor("/Users/matt/Desktop/Turbin3/Q3T_Sol_Matt_Weichel/courses/week2/escrow", [], []);     
  //   const client = context.banksClient;
  //   const wallet_c = context.payer;
  //   const transferLamports = 10000000000;
  //   let blockhash = context.lastBlockhash;
  //   const ixs = [
  //     SystemProgram.transfer({
  //       fromPubkey: wallet_c.publicKey,
  //       toPubkey: wallet_a.publicKey,
  //       lamports: transferLamports,
  //     }),
  //   ];
  //   let tx1 = new Transaction();
  //   tx1.recentBlockhash = blockhash;
  //   tx1.add(...ixs);
  //   tx1.sign(wallet_c);
  //   await client.processTransaction(tx1);
  //   console.log('Wallet A balance:', await client.getBalance(wallet_a.publicKey));
  //   let lamports = await getMinimumBalanceForRentExemptMint(connection);
  //   let tx = new Transaction();
  //   tx.instructions = [
  //     anchor.web3.SystemProgram.createAccount({fromPubkey: wallet.publicKey, newAccountPubkey: mint_a.publicKey, lamports, space: MINT_SIZE, programId: TOKEN_PROGRAM_ID}),
  //     createInitializeMint2Instruction(mint_a.publicKey, 6, wallet.publicKey, null),
  //     createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, wallet_a_ata, wallet.publicKey, mint_a.publicKey),
  //     createMintToInstruction(mint_a.publicKey, wallet_a_ata, wallet.publicKey, 1e9),
  //   ];

  //   // await provider.sendAndConfirm(tx, [wallet.payer, mint_a]);

  //   console.log('mint_a:', mint_a.publicKey.toBase58());
  //   console.log('mint ata:', wallet_a_ata.toBase58());
    
  //   tx.recentBlockhash = blockhash;
  //   tx.sign(wallet_a.payer, mint_a);
  //   await client.processTransaction(tx);
  //   const balanceAfter = await client.getBalance(wallet_a_ata);
  //   expect(balanceAfter).to.be.equal(BigInt(2039280));
  // });

   it("Setup Mint and Accounts", async () => {
    let lamports = await getMinimumBalanceForRentExemptMint(connection);
    let tx = new Transaction();
    tx.instructions = [
      anchor.web3.SystemProgram.createAccount({fromPubkey: wallet.publicKey, newAccountPubkey: mint_a.publicKey, lamports, space: MINT_SIZE, programId: TOKEN_PROGRAM_ID}),
      createInitializeMint2Instruction(mint_a.publicKey, 6, wallet.publicKey, null),
      createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, wallet_a_ata, wallet.publicKey, mint_a.publicKey),
      createMintToInstruction(mint_a.publicKey, wallet_a_ata, wallet.publicKey, 1e9),
    ];

    await provider.sendAndConfirm(tx, [wallet.payer, mint_a]);

    let tx2 = new Transaction();
    tx2.instructions = [
      anchor.web3.SystemProgram.createAccount({fromPubkey: wallet.publicKey, newAccountPubkey: mint_b.publicKey, lamports, space: MINT_SIZE, programId: TOKEN_PROGRAM_ID}),
      createInitializeMint2Instruction(mint_b.publicKey, 6, wallet.publicKey, null),
      createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, wallet_bB_ata, wallet_b.publicKey, mint_b.publicKey),
      createMintToInstruction(mint_b.publicKey, wallet_bB_ata, wallet.publicKey, 1e9),
    ];

    await provider.sendAndConfirm(tx2, [wallet.payer, mint_b]);
    // airdrop to wallet_b
    await connection.requestAirdrop(wallet_b.publicKey, 1000000000);

    let tx3 = new Transaction();
    tx3.instructions = [
      // anchor.web3.SystemProgram.createAccount({fromPubkey: wallet.publicKey, newAccountPubkey: mint_a.publicKey, lamports, space: MINT_SIZE, programId: TOKEN_PROGRAM_ID}),
      // createInitializeMint2Instruction(mint_a.publicKey, 6, escrow, null),
      createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, escrowAta, escrow, mint_a.publicKey),
      // createMintToInstruction(mint_a.publicKey, escrowAta, wallet.publicKey, 1e9),
    ];

    // await provider.sendAndConfirm(tx3, [wallet.payer, mint_a]);
  });


  it("Is initialized!", async () => {
    const context = await startAnchor("/Users/matt/Desktop/Turbin3/Q3T_Sol_Matt_Weichel/courses/week2/escrow", [], []);     
    const executableAccount = await connection.getAccountInfo(programId);

    expect(executableAccount).to.not.be.null;
    expect(executableAccount!.executable).to.be.true;
  });

  it("Makes a new escrow account", async () => {

    console.log('escrow:', escrow.toBase58());
    console.log('escrow ata:', escrowAta.toBase58());
    

    await program.methods
    .make(
      new anchor.BN(seed), 
      new anchor.BN(12), 
      new anchor.BN(12)
    )
    .accountsPartial({
      escrow: escrow,
      maker: wallet_a.publicKey,
      mintA: mint_a.publicKey,
      mintB: mint_b.publicKey,
      makerAtaA: wallet_a_ata,
      vault: escrowAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([
      wallet_a.payer,
    ])
    .rpc();
  });

  it("Takes and closes a escrow deal", async () => {
    await program.methods
    .take()
    .accountsPartial({
      taker: wallet_b.publicKey,
      maker: wallet_a.publicKey,
      mintA: mint_a.publicKey,
      mintB: mint_b.publicKey,
      takerAtaA: wallet_b_ata,
      makerAtaB: wallet_aB_ata,
      takerAtaB: wallet_bB_ata,
      escrow: escrow,
      vault: escrowAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([
      wallet_b,
    ])
    .rpc();
  });

  it("Makes a new escrow deal", async () => {
    console.log('escrow:', escrow.toBase58());
    console.log('escrow ata:', escrowAta.toBase58());
    
    const seed2 = new anchor.BN(2);
    const escrow2 = PublicKey.findProgramAddressSync([Buffer.from("escrow"), wallet_a.publicKey.toBuffer(), seed2.toBuffer("le", 8)], program.programId)[0];
    const escrow2Ata = getAssociatedTokenAddressSync(mint_a.publicKey, escrow2, true);

    await program.methods
    .make(
      new anchor.BN(seed), 
      new anchor.BN(12), 
      new anchor.BN(12)
    )
    .accountsPartial({
      escrow: escrow2,
      maker: wallet_a.publicKey,
      mintA: mint_a.publicKey,
      mintB: mint_b.publicKey,
      makerAtaA: wallet_a_ata,
      vault: escrow2Ata,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([
      wallet_a.payer,
    ])
    .rpc();
  });

  it("Refunds and closese a escrow deal", async () => {
      const seed2 = new anchor.BN(2);
      const escrow2 = PublicKey.findProgramAddressSync([Buffer.from("escrow"), wallet_a.publicKey.toBuffer(), seed2.toBuffer("le", 8)], program.programId)[0];
      const escrow2Ata = getAssociatedTokenAddressSync(mint_a.publicKey, escrow2, true);
      await program.methods
      .refund()
      .accountsPartial({
        maker: wallet_a.publicKey,
        mintA: mint_a.publicKey,
        makerAtaA: wallet_a_ata,
        escrow: escrow2,
        vault: escrow2Ata,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([
        wallet_a.payer,
      ])
      .rpc();
    });
});
