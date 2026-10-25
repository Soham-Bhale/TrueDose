import os
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# -----------------------------------------------------------------------------
# 1. Numbered Canvas for Two-Pass Page Numbering & Running Headers/Footers
# -----------------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip running header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#555555"))

        # Running Header
        self.drawString(54, 755, "LifeLedger Platform — UI Specification, Button Directory & Architecture Report")
        self.drawRightString(612 - 54, 755, "v2.0.0 (PoA EVM)")
        self.setStrokeColor(colors.HexColor("#D4D0C8"))
        self.setLineWidth(0.75)
        self.line(54, 747, 612 - 54, 747)

        # Running Footer
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "Decentralized Organ Procurement & Transplant Custody Network • NOTTO / UNOS Compliant")
        self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

# -----------------------------------------------------------------------------
# 2. Generate Diagrams
# -----------------------------------------------------------------------------
def generate_diagrams(arch_path, workflow_path):
    # Diagram 1: Architecture
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#F8F9FA')
    ax.set_facecolor('#F8F9FA')

    ax.text(50, 96, "LifeLedger: Decentralized 4-Tier Consortium Architecture", 
            fontsize=14, fontweight='bold', ha='center', color='#0A246A', fontfamily='sans-serif')
    ax.text(50, 92.5, "Proof-of-Authority EVM Ledger • IPFS Form 8 Vault • Real-Time Cryo-Telemetry • Java Swing AWT UI", 
            fontsize=8, ha='center', color='#555555', fontfamily='sans-serif')

    # Tier 1
    l1 = patches.FancyBboxPatch((5, 71), 90, 17, boxstyle="round,pad=1", ec="#0A246A", fc="#ECE9D8", lw=1.5)
    ax.add_patch(l1)
    ax.text(8, 84, "TIER 1: PRESENTATION WORKSTATION (RETRO JAVA SWING / AWT WORKSPACE)", fontsize=8.5, fontweight='bold', color='#0A246A')
    
    boxes_l1 = [
        ("OPO Node UI", "Lilavati Harvest Portal\nOrgan & Form 8 Register", 7, 73, 19),
        ("Logistics UI", "AeroMed Fleet Portal\nCryo-Telemetry & Transit", 28, 73, 19),
        ("Authority UI", "NOTTO Directorate Portal\nQueue & HLA Match Clearance", 49, 73, 20),
        ("Hospital UI", "Apollo Surgical Suite\nImplantation & Reperfusion", 71, 73, 22),
    ]
    for title, desc, x, y, w in boxes_l1:
        b = patches.FancyBboxPatch((x, y), w, 8.5, boxstyle="round,pad=0.5", ec="#808080", fc="#FFFFFF", lw=1)
        ax.add_patch(b)
        ax.text(x + w/2, y + 5.5, title, fontsize=7.5, fontweight='bold', ha='center', color='#111111')
        ax.text(x + w/2, y + 2, desc, fontsize=6, ha='center', color='#555555')

    ax.annotate('', xy=(50, 68), xytext=(50, 71),
                arrowprops=dict(facecolor='#0A246A', edgecolor='#0A246A', width=1.5, headwidth=5))
    ax.text(52, 69, "REST API / JWT Auth (Port 5000)", fontsize=7, color='#0A246A', fontweight='bold')

    # Tier 2
    l2 = patches.FancyBboxPatch((5, 48), 90, 18, boxstyle="round,pad=1", ec="#2B6CB0", fc="#EDF2F7", lw=1.5)
    ax.add_patch(l2)
    ax.text(8, 62, "TIER 2: CONSORTIUM APPLICATION GATEWAY (NODE.JS / EXPRESS)", fontsize=8.5, fontweight='bold', color='#2B6CB0')

    boxes_l2 = [
        ("Auth & RBAC Middleware", "Role Authorization Guards\nJWT / Ethereum Signer Auth", 7, 50, 20),
        ("Cold Ischemia Engine", "Elapsed Time Calculation\nSafe Window Limits Enforcement", 29, 50, 21),
        ("Blockchain Gateway", "Ethers.js RPC Provider\nSHA-256 Ledger Fallback", 52, 50, 20),
        ("Regulatory Alert Hub", "Trafficking Incident Store\nLive Auditor Flagging", 74, 50, 19),
    ]
    for title, desc, x, y, w in boxes_l2:
        b = patches.FancyBboxPatch((x, y), w, 9, boxstyle="round,pad=0.5", ec="#CBD5E0", fc="#FFFFFF", lw=1)
        ax.add_patch(b)
        ax.text(x + w/2, y + 6, title, fontsize=7.5, fontweight='bold', ha='center', color='#1A365D')
        ax.text(x + w/2, y + 2.2, desc, fontsize=6, ha='center', color='#4A5568')

    ax.annotate('', xy=(50, 45), xytext=(50, 48),
                arrowprops=dict(facecolor='#2B6CB0', edgecolor='#2B6CB0', width=1.5, headwidth=5))
    ax.text(52, 46, "RPC Calls / IPFS Multihash Queries", fontsize=7, color='#2B6CB0', fontweight='bold')

    # Tier 3
    l3 = patches.FancyBboxPatch((5, 23), 90, 20, boxstyle="round,pad=1", ec="#276749", fc="#F0FFF4", lw=1.5)
    ax.add_patch(l3)
    ax.text(8, 39, "TIER 3: CONSORTIUM LEDGER & SMART CONTRACTS (ETHEREUM PARIS EVM)", fontsize=8.5, fontweight='bold', color='#276749')

    boxes_l3 = [
        ("LifeLedger.sol Contract", "State Machine & Custody Rules\nQuarantine Lock Controls", 7, 25, 26),
        ("Consortium Validator Nodes", "PoA Consensus (Lilavati, NOTTO,\nAeroMed, Apollo, Ministry)", 35, 25, 28),
        ("Immutable Storage State", "Organ Structs, Custody Array,\nCold-Ischemia Parameters", 65, 25, 28),
    ]
    for title, desc, x, y, w in boxes_l3:
        b = patches.FancyBboxPatch((x, y), w, 11, boxstyle="round,pad=0.5", ec="#9AE6B4", fc="#FFFFFF", lw=1)
        ax.add_patch(b)
        ax.text(x + w/2, y + 7.5, title, fontsize=7.5, fontweight='bold', ha='center', color='#22543D')
        ax.text(x + w/2, y + 2.5, desc, fontsize=6, ha='center', color='#4A5568')

    ax.annotate('', xy=(50, 20), xytext=(50, 23),
                arrowprops=dict(facecolor='#276749', edgecolor='#276749', width=1.5, headwidth=5))

    # Tier 4
    l4 = patches.FancyBboxPatch((5, 3), 90, 15, boxstyle="round,pad=1", ec="#7B341E", fc="#FFFAF0", lw=1.5)
    ax.add_patch(l4)
    ax.text(8, 14.5, "TIER 4: DECENTRALIZED VAULT & PHYSICAL COLD-CHAIN TELEMETRY", fontsize=8.5, fontweight='bold', color='#7B341E')

    boxes_l4 = [
        ("IPFS Vault (InterPlanetary File System)", "Form 8 Deceased Donor Consent • Brain Death Reflex Record • Biopsy Histopathology CID", 7, 5, 41),
        ("Cryo-Carrier IoT Sensor Probes", "Continuous Micro-Perfusion Probe • 2°C - 4°C Thermal Monitor • Tamper Seal Detection", 51, 5, 42),
    ]
    for title, desc, x, y, w in boxes_l4:
        b = patches.FancyBboxPatch((x, y), w, 7.5, boxstyle="round,pad=0.5", ec="#FBD38D", fc="#FFFFFF", lw=1)
        ax.add_patch(b)
        ax.text(x + w/2, y + 4.5, title, fontsize=7, fontweight='bold', ha='center', color='#7B341E')
        ax.text(x + w/2, y + 1.5, desc, fontsize=5.8, ha='center', color='#4A5568')

    plt.tight_layout()
    plt.savefig(arch_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

    # Diagram 2: Workflow
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#F8F9FA')
    ax.set_facecolor('#F8F9FA')

    ax.text(50, 96, "LifeLedger: Organ Custody & State Machine Lifecycle Workflow", 
            fontsize=14, fontweight='bold', ha='center', color='#0A246A', fontfamily='sans-serif')
    ax.text(50, 92.5, "Strict Step-by-Step Chain-of-Custody Handoffs • Cold Ischemia Clock • Emergency Quarantine Branch", 
            fontsize=8, ha='center', color='#555555', fontfamily='sans-serif')

    steps = [
        ("STEP 1: HARVEST", "Lilavati Trauma OPO", "HarvestOrgan()\nForm 8 Consent Hash\nLock Ischemic Limit", 5, 68, 17, "#D1E7DD", "#0F5132"),
        ("STEP 2: AIR TRANSIT", "AeroMed Logistics", "transferCustody()\nIoT Cryo Probe (2.4°C)\nGreen-Corridor Transit", 27, 68, 17, "#CFE2FF", "#084298"),
        ("STEP 3: ALLOCATION", "NOTTO Clearinghouse", "transferCustody()\nHLA Matching Verified\nRecipient Queue Match", 49, 68, 17, "#E2D9F3", "#432874"),
        ("STEP 4: SURGICAL SUITE", "Apollo Surgical Center", "Hospital Receipt in OR\nPre-Op Perfusion Check\nCrossmatch Confirmed", 71, 68, 17, "#FFF3CD", "#664D03"),
        ("STEP 5: IMPLANTATION", "Apollo Transplant Team", "completeTransplant()\nGraft Reperfusion\nFinal EVM Block Closed", 71, 35, 17, "#D1E7DD", "#0F5132"),
    ]

    for title, role, desc, x, y, w, bg, fg in steps:
        b = patches.FancyBboxPatch((x, y), w, 18, boxstyle="round,pad=0.8", ec=fg, fc=bg, lw=1.5)
        ax.add_patch(b)
        ax.text(x + w/2, y + 15, title, fontsize=7.5, fontweight='bold', ha='center', color=fg)
        ax.text(x + w/2, y + 12, role, fontsize=6.5, fontweight='bold', ha='center', color='#333333')
        ax.text(x + w/2, y + 4, desc, fontsize=6, ha='center', color='#222222')

    arrows = [
        ((22, 77), (27, 77)),
        ((44, 77), (49, 77)),
        ((66, 77), (71, 77)),
        ((79.5, 68), (79.5, 53)),
    ]
    for (x1, y1), (x2, y2) in arrows:
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(facecolor='#0A246A', edgecolor='#0A246A', width=2, headwidth=5))

    qb = patches.FancyBboxPatch((15, 15), 53, 18, boxstyle="round,pad=1", ec="#DC3545", fc="#F8D7DA", lw=2)
    ax.add_patch(qb)
    ax.text(41.5, 29, "EMERGENCY REGULATORY QUARANTINE ORDER (BRANCH)", fontsize=8, fontweight='bold', ha='center', color="#842029")
    ax.text(41.5, 23.5, "Authorized: National Authority (NOTTO) or Consortium Admin", fontsize=7, fontweight='bold', ha='center', color="#333333")
    ax.text(41.5, 18, "Triggers: Illegal Trafficking Suspicion • Thermal Excursion > 8°C • Expired Safe Ischemia Window\nSmart Contract Effect: organ.isQuarantined = true -> ALL downstream transfers & surgical procedures BLOCKED", 
            fontsize=6, ha='center', color="#58151c")

    ax.annotate('Incident Flagged', xy=(41.5, 33), xytext=(35.5, 68),
                arrowprops=dict(facecolor='#DC3545', edgecolor='#DC3545', width=1.5, headwidth=5, linestyle='dashed'),
                fontsize=7, color='#DC3545', fontweight='bold')

    plt.tight_layout()
    plt.savefig(workflow_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

# -----------------------------------------------------------------------------
# 3. Build Full PDF Report
# -----------------------------------------------------------------------------
def build_pdf_report(pdf_path, arch_img_path, workflow_img_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    c_navy = colors.HexColor('#0A246A')
    c_dark = colors.HexColor('#1A1A1A')
    c_gray = colors.HexColor('#555555')
    c_card_bg = colors.HexColor('#ECE9D8')

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_navy,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_gray,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=c_navy,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0A246A')
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#22543D')
    )

    story = []

    # ── COVER / TITLE HEADER ────────────────────────────────────────────────
    story.append(Paragraph("LifeLedger Consortium Platform", title_style))
    story.append(Paragraph("Comprehensive User Interface Specification, Button Directory & System Architecture Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_navy, spaceBefore=0, spaceAfter=12))

    meta_data = [
        [Paragraph("<b>System Identity:</b>", body_style), Paragraph("LifeLedger (PoA EVM Consortium v2.0)", body_style),
         Paragraph("<b>Date of Release:</b>", body_style), Paragraph("October 25, 2026", body_style)],
        [Paragraph("<b>Author / Lead:</b>", body_style), Paragraph("Soham Bhale (TrueDose Project)", body_style),
         Paragraph("<b>Compliance:</b>", body_style), Paragraph("NOTA / THOTA & NOTTO Form 8", body_style)],
        [Paragraph("<b>UI Look & Feel:</b>", body_style), Paragraph("Retro Java Swing / AWT Workstation", body_style),
         Paragraph("<b>Test Verification:</b>", body_style), Paragraph("41/41 Automated Invariants (100%)", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[95, 160, 95, 154])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F4F2E8')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#808080')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D4D0C8')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    # ── SECTION 1: EXECUTIVE OVERVIEW ───────────────────────────────────────
    story.append(Paragraph("1. Executive Summary & Problem Resolution", h1_style))
    p1 = ("<b>LifeLedger</b> is a decentralized medical blockchain network designed to address critical vulnerabilities "
          "in the human organ transplantation supply chain: black-market commercial trafficking, falsified deceased donor "
          "consent papers, and ischemic cellular death caused by cold-chain transit delays. By combining an immutable "
          "Proof-of-Authority (PoA) Ethereum Virtual Machine (EVM) ledger with decentralized IPFS document storage, "
          "real-time cryo-perfusion telemetry (2°C - 4°C), and an authentic retro Java Swing / AWT desktop GUI, LifeLedger "
          "enforces mathematical non-repudiation across hospitals, organ procurement organizations (OPOs), and national "
          "health authorities.")
    story.append(Paragraph(p1, body_style))
    story.append(Spacer(1, 8))

    # ── SECTION 2: 4-TIER SYSTEM ARCHITECTURE ──────────────────────────────
    story.append(Paragraph("2. Consortium System Architecture & Infrastructure", h1_style))
    p_arch = ("The LifeLedger architecture is divided into 4 decoupled, fault-tolerant tiers ensuring that real-time "
              "sensor telemetry, legal documents, and blockchain state transitions synchronize with millisecond finality:")
    story.append(Paragraph(p_arch, body_style))

    # Architecture Diagram
    if os.path.exists(arch_img_path):
        story.append(Image(arch_img_path, width=7*72, height=4.34*72))
        story.append(Spacer(1, 8))

    arch_table_data = [
        [Paragraph("<b>Architectural Tier</b>", body_bold), Paragraph("<b>Key Technologies</b>", body_bold), Paragraph("<b>Consortium Responsibility</b>", body_bold)],
        [Paragraph("<b>Tier 1: Workstation UI</b>", body_style), Paragraph("React 19, Vite, Tailwind CSS, Retro Java Swing Look & Feel", body_style), Paragraph("Workstation menus (JMenuBar), beveled buttons (JToolBar), registry table (JTable), and dialogs (JDialog).", body_style)],
        [Paragraph("<b>Tier 2: API Gateway</b>", body_style), Paragraph("Node.js, Express, Ethers.js, JWT, SHA-256 Engine", body_style), Paragraph("RBAC authorization middleware, dynamic cold ischemia countdown engine, and live regulatory alert dispatch.", body_style)],
        [Paragraph("<b>Tier 3: Consortium EVM</b>", body_style), Paragraph("Solidity v0.8.20, Hardhat, Paris EVM, PoA Consensus", body_style), Paragraph("Smart contract (LifeLedger.sol) enforcing custody authorization, zero double-allocation, and quarantine locks.", body_style)],
        [Paragraph("<b>Tier 4: Vault & IoT</b>", body_style), Paragraph("IPFS (InterPlanetary File System), Cryo Probes, QR/RFID", body_style), Paragraph("Cryptographic storage of Form 8 donor consent papers, brain death reflex evaluations, and continuous 2-4°C sensors.", body_style)],
    ]
    t_arch = Table(arch_table_data, colWidths=[110, 140, 254])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A246A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # ── SECTION 3: ORGAN CUSTODY WORKFLOW & STATE MACHINE ───────────────────
    story.append(PageBreak())
    story.append(Paragraph("3. End-to-End Organ Custody & State Machine Lifecycle", h1_style))
    p_wf = ("Every human organ registered on LifeLedger moves through an immutable state machine where state transitions "
            "are strictly governed by the smart contract. Cold-ischemia time windows (Heart: 4h, Liver: 12h, Kidney: 24h) "
            "are locked at harvest, and any regulatory entity can execute an instant consortium-wide quarantine freeze.")
    story.append(Paragraph(p_wf, body_style))

    # Workflow Diagram
    if os.path.exists(workflow_img_path):
        story.append(Image(workflow_img_path, width=7*72, height=4.34*72))
        story.append(Spacer(1, 8))

    wf_steps_data = [
        [Paragraph("<b>Lifecycle Phase</b>", body_bold), Paragraph("<b>Authorized Node</b>", body_bold), Paragraph("<b>Smart Contract Action & Rules Enforced</b>", body_bold)],
        [Paragraph("<b>1. Deceased Donor Harvest</b>", body_style), Paragraph("Lilavati Trauma OPO (OPO_ROLE)", body_style), Paragraph("Calls <code>harvestOrgan()</code>. Locks donor ID, ABO blood group, HLA markers, initial cryo temp, and Form 8 IPFS CID.", body_style)],
        [Paragraph("<b>2. Cold-Chain Air Transit</b>", body_style), Paragraph("AeroMed Logistics (LOGISTICS_ROLE)", body_style), Paragraph("Calls <code>transferCustody()</code>. Dispatches green-corridor flight, logs probe telemetry (2.4°C), and updates location.", body_style)],
        [Paragraph("<b>3. Allocation Clearance</b>", body_style), Paragraph("NOTTO Directorate (AUTHORITY_ROLE)", body_style), Paragraph("Verifies histocompatibility crossmatch, audits recipient prioritization queue, and clears hospital destination.", body_style)],
        [Paragraph("<b>4. Surgical Suite Handoff</b>", body_style), Paragraph("Apollo Surgical Hospital (HOSPITAL_ROLE)", body_style), Paragraph("Receives organ in Operating Theater. Surgeon verifies seal integrity and cold-perfusion viability.", body_style)],
        [Paragraph("<b>5. Implantation Sign-Off</b>", body_style), Paragraph("Apollo Surgical Hospital (HOSPITAL_ROLE)", body_style), Paragraph("Calls <code>completeTransplant()</code>. Reperfusion verified. Organ state permanently marked as <code>Transplanted</code>.", body_style)],
        [Paragraph("<b>Emergency Quarantine</b>", body_style), Paragraph("Health Authority / Admin (ADMIN_ROLE)", body_style), Paragraph("Calls <code>quarantineOrgan()</code>. Triggers immediate consortium-wide freeze. Blocks all further transfers.", body_style)]
    ]
    t_wf = Table(wf_steps_data, colWidths=[110, 130, 264])
    t_wf.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F5132')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_wf)
    story.append(Spacer(1, 14))

    # ── SECTION 4: COMPLETE BUTTON & UI CONTROL DIRECTORY ──────────────────
    story.append(PageBreak())
    story.append(Paragraph("4. Comprehensive Button & UI Control Directory", h1_style))
    p_btn = ("The following exhaustive directory details every interactive button, menu item, dropdown, and dialog "
             "control across the entire LifeLedger desktop application, including their technical event triggers and system effects:")
    story.append(Paragraph(p_btn, body_style))

    # Subsection 4.1: Top Navigation, JMenuBar & JToolBar
    story.append(Paragraph("4.1 Navigation Bar, JMenuBar & JToolBar Controls", h2_style))
    nav_btn_data = [
        [Paragraph("<b>Control Element</b>", body_bold), Paragraph("<b>Type</b>", body_bold), Paragraph("<b>Action & Operational Effect</b>", body_bold)],
        [Paragraph("<b>File Menu</b>", body_style), Paragraph("JMenu", body_style), Paragraph("Opens file dropdown: <i>Harvest Donor Organ</i> (opens harvest modal), <i>Print Specimen Manifest</i>, and <i>Exit Workstation</i>.", body_style)],
        [Paragraph("<b>View Menu</b>", body_style), Paragraph("JMenu", body_style), Paragraph("Switches workspace frame: <i>Organ Custody Registry</i> (F2), <i>Provenance Inspector</i> (F3), and <i>Consortium Explorer</i> (F4).", body_style)],
        [Paragraph("<b>Stakeholders Menu</b>", body_style), Paragraph("JMenu", body_style), Paragraph("Switches active Ethereum signing identity between NOTTO Admin, Lilavati OPO, AeroMed, NOTTO Allocation, and Apollo.", body_style)],
        [Paragraph("<b>Help Menu</b>", body_style), Paragraph("JMenu", body_style), Paragraph("Displays: <i>System Architecture & Viva Defense Manual</i> (F1), <i>API Health Status Check</i>, and <i>Sample REST JSON</i>.", body_style)],
        [Paragraph("<b>[Harvest Organ]</b>", body_style), Paragraph("JToolBar Btn", body_style), Paragraph("Available to OPO & Admin. Launches the <code>CreateBatchModal</code> dialog to record a newly procured donor graft.", body_style)],
        [Paragraph("<b>[Organ Registry]</b>", body_style), Paragraph("JToolBar Btn", body_style), Paragraph("Switches active view to the main organ inventory grid (<code>DashboardPage</code>) with live cold-ischemia clocks.", body_style)],
        [Paragraph("<b>[Provenance]</b>", body_style), Paragraph("JToolBar Btn", body_style), Paragraph("Navigates to the public verification inspection terminal (<code>VerifyPage</code>) for cryptographic donor audits.", body_style)],
        [Paragraph("<b>[Consortium]</b>", body_style), Paragraph("JToolBar Btn", body_style), Paragraph("Opens the Proof-of-Authority node explorer (<code>ExplorerPage</code>) displaying validator health and transaction pings.", body_style)],
        [Paragraph("<b>[Refresh (F5)]</b>", body_style), Paragraph("JToolBar Btn", body_style), Paragraph("Re-fetches fresh ledger records, updates elapsed cold-ischemia hours, and recalculates active incident cases.", body_style)],
        [Paragraph("<b>Quick Presets (Kidney / Heart / Liver)</b>", body_style), Paragraph("JToolBar Btns", body_style), Paragraph("Instantly switches the active workstation node to match the operational team responsible for that organ.", body_style)],
        [Paragraph("<b>Consortium Role (JComboBox)</b>", body_style), Paragraph("JComboBox", body_style), Paragraph("Dropdown that dynamically changes the active user context (OPO, Logistics, Authority, Hospital, Admin).", body_style)],
        [Paragraph("<b>[Defense Guide [F1]]</b>", body_style), Paragraph("JToolBar Btn", body_style), Paragraph("Opens the Project Defense Guide modal containing 1-minute demo sequence and examiner viva talking points.", body_style)],
    ]
    t_nav = Table(nav_btn_data, colWidths=[120, 75, 309])
    t_nav.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A246A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_nav)
    story.append(Spacer(1, 10))

    # Subsection 4.2: Dashboard Grid & Table Actions
    story.append(Paragraph("4.2 Organ Custody Registry Table (DashboardPage) Actions", h2_style))
    dash_btn_data = [
        [Paragraph("<b>Control Element</b>", body_bold), Paragraph("<b>Type</b>", body_bold), Paragraph("<b>Action & Operational Effect</b>", body_bold)],
        [Paragraph("<b>Status Filter Tabs</b>", body_style), Paragraph("JButton Filter", body_style), Paragraph("Filters registry rows: <i>All Records</i>, <i>In Transit (Cryo)</i>, <i>Allocation Cleared</i>, <i>Transplanted</i>, or <i>Quarantined</i>.", body_style)],
        [Paragraph("<b>Search Registry Input</b>", body_style), Paragraph("JTextField", body_style), Paragraph("Live text filter matching Organ ID, Organ Type, Blood Group, Donor ID, or Recipient Hospital.", body_style)],
        [Paragraph("<b>Table Row Selection</b>", body_style), Paragraph("JTable Click", body_style), Paragraph("Highlights selected row in classic navy <code>#0A246A</code> and activates contextual custody actions.", body_style)],
        [Paragraph("<b>[Inspect] (Eye Icon)</b>", body_style), Paragraph("Table Action Btn", body_style), Paragraph("Navigates directly to <code>VerifyPage</code> with this specific organ pre-loaded for full donor provenance audit.", body_style)],
        [Paragraph("<b>[Tag] (QrCode Icon)</b>", body_style), Paragraph("Table Action Btn", body_style), Paragraph("Opens <code>QRCodeModal</code> displaying printable Cryo-Carrier Specimen Tag with QR code and manifest.", body_style)],
        [Paragraph("<b>[Form 8] (Award Icon)</b>", body_style), Paragraph("Table Action Btn", body_style), Paragraph("Opens <code>CertificateModal</code> displaying the official Form 8 Deceased Donor Consent and Brain Death Clearance.", body_style)],
        [Paragraph("<b>[Transfer] (Truck Icon)</b>", body_style), Paragraph("Table Action Btn", body_style), Paragraph("Enabled only for current custodian. Opens <code>TransferModal</code> to execute blockchain custody handoff.", body_style)],
        [Paragraph("<b>[Implant] (Heart Icon)</b>", body_style), Paragraph("Table Action Btn", body_style), Paragraph("Enabled only for Hospital nodes when organ is received. Executes final surgical sign-off and reperfusion.", body_style)],
        [Paragraph("<b>[Hold] (ShieldAlert Icon)</b>", body_style), Paragraph("Table Action Btn", body_style), Paragraph("Issues instant emergency regulatory quarantine on the organ, locking all downstream transfers on-chain.", body_style)],
    ]
    t_dash = Table(dash_btn_data, colWidths=[120, 85, 299])
    t_dash.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A246A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_dash)
    story.append(Spacer(1, 10))

    # Subsection 4.3: Verification Inspector Controls
    story.append(PageBreak())
    story.append(Paragraph("4.3 Organ Provenance Inspector (VerifyPage) Actions", h2_style))
    ver_btn_data = [
        [Paragraph("<b>Control Element</b>", body_bold), Paragraph("<b>Type</b>", body_bold), Paragraph("<b>Action & Operational Effect</b>", body_bold)],
        [Paragraph("<b>Organ Registry ID Input</b>", body_style), Paragraph("JTextField", body_style), Paragraph("Accepts specimen barcode string (e.g. <code>ORG-KID-8041</code>, <code>ORG-HRT-2094</code>).", body_style)],
        [Paragraph("<b>[Interrogate Ledger]</b>", body_style), Paragraph("JButton Submit", body_style), Paragraph("Dispatches cryptographic REST query to <code>/api/verify/:organId</code> and renders verified provenance timeline.", body_style)],
        [Paragraph("<b>[Scan QR / RFID]</b>", body_style), Paragraph("JButton Tool", body_style), Paragraph("Opens <code>QRScannerModal</code> to scan physical packaging QR using device camera or file upload.", body_style)],
        [Paragraph("<b>Preset: ORG-KID-8041</b>", body_style), Paragraph("JButton Preset", body_style), Paragraph("Instantly loads kidney specimen in active cryo-transit (O+ blood group, 24h limit, Custodiol perfusion).", body_style)],
        [Paragraph("<b>Preset: ORG-HRT-2094</b>", body_style), Paragraph("JButton Preset", body_style), Paragraph("Instantly loads critical heart specimen in air transit under 4-hour emergency ischemia timer.", body_style)],
        [Paragraph("<b>Preset: ORG-LVR-5512</b>", body_style), Paragraph("JButton Preset", body_style), Paragraph("Instantly loads liver specimen received in surgical suite ready for operating theater implantation.", body_style)],
        [Paragraph("<b>Preset: ORG-COR-3390</b>", body_style), Paragraph("JButton Preset", body_style), Paragraph("Demonstrates regulatory quarantine lock state due to biosafety or chain-of-custody discrepancy.", body_style)],
        [Paragraph("<b>Preset: ORG-FAKE-999</b>", body_style), Paragraph("JButton Preset", body_style), Paragraph("Demonstrates anti-trafficking counterfeit detection (returns 404 UNREGISTERED ORGAN alert).", body_style)],
        [Paragraph("<b>[Donor Consent (Form 8)]</b>", body_style), Paragraph("JButton Dialog", body_style), Paragraph("Displays printable Form 8 brain-death clearance certificate anchored to IPFS multihash.", body_style)],
        [Paragraph("<b>[Flag Incident]</b>", body_style), Paragraph("JButton Danger", body_style), Paragraph("Opens <code>ReportModal</code> to file an emergency whistleblower trafficking or temperature breach alert.", body_style)],
        [Paragraph("<b>[Copy TxHash]</b>", body_style), Paragraph("JButton Action", body_style), Paragraph("Copies the cryptographic transaction hash of any custody milestone directly to clipboard.", body_style)],
    ]
    t_ver = Table(ver_btn_data, colWidths=[120, 85, 299])
    t_ver.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A246A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_ver)
    story.append(Spacer(1, 10))

    # Subsection 4.4: Dialog Modals & Interactive Actions
    story.append(Paragraph("4.4 Modal Dialogs (JDialogs) & Action Buttons", h2_style))
    modals_btn_data = [
        [Paragraph("<b>Modal Dialog (JDialog)</b>", body_bold), Paragraph("<b>Key Buttons / Controls</b>", body_bold), Paragraph("<b>Action & Operational Effect</b>", body_bold)],
        [Paragraph("<b>Harvest Organ Modal (CreateBatchModal)</b>", body_style),
         Paragraph("• Template Presets (Kidney/Heart/Liver)<br/>• [OK - Sign & Register Harvest]<br/>• [Cancel] / [X]", body_style),
         Paragraph("Populates donor genetic data. Executes POST /api/organs creating immutable EVM block record and sets cold-ischemia countdown.", body_style)],
        [Paragraph("<b>Custody Transfer Modal (TransferModal)</b>", body_style),
         Paragraph("• Consortium Entity Dropdown<br/>• Milestone Location Field<br/>• [OK - Sign Medical Handoff]", body_style),
         Paragraph("Selects recipient stakeholder node. Signs custody transfer on-chain with real-time temperature telemetry (2.4°C).", body_style)],
        [Paragraph("<b>Specimen Manifest Modal (QRCodeModal)</b>", body_style),
         Paragraph("• [Copy Verify URL]<br/>• [Print Carrier Tag]<br/>• [X] Close", body_style),
         Paragraph("Copies browser verification URL or triggers window.print() for physical cryo-shipper box RFID/QR barcode label.", body_style)],
        [Paragraph("<b>Consent Certificate Modal (CertificateModal)</b>", body_style),
         Paragraph("• [Print Form 8 Certificate]<br/>• [X] Close", body_style),
         Paragraph("Formats official legal Form 8 Deceased Donor Certificate with IPFS multihash stamp and surgeon signature for printing.", body_style)],
        [Paragraph("<b>Trafficking Alert Modal (ReportModal)</b>", body_style),
         Paragraph("• Violation Category Dropdown<br/>• [OK - Dispatch Regulatory Alert]<br/>• [Switch to Regulatory Admin]", body_style),
         Paragraph("Files immediate whistleblower report to NOTTO auditors and allows instant switching to Admin workstation to quarantine the organ.", body_style)],
        [Paragraph("<b>Optical QR Scanner (QRScannerModal)</b>", body_style),
         Paragraph("• [Webcam Scanner] Tab<br/>• [Demo Presets] Tab<br/>• [Load QR Image File]", body_style),
         Paragraph("Decodes QR barcodes via Html5Qrcode camera stream or uploaded graphics files, automatically launching verification.", body_style)],
        [Paragraph("<b>Defense & Viva Guide (PresentationGuideModal)</b>", body_style),
         Paragraph("• [Live Demo Flow] Tab<br/>• [Viva Defense] Tab<br/>• [Smart Contract Rules] Tab", body_style),
         Paragraph("Guides student / presenter through 1-minute chronological demonstration sequence and examiner viva arguments.", body_style)],
        [Paragraph("<b>Bottom Status Strip (JStatusBar)</b>", body_style),
         Paragraph("• [API Health] Link<br/>• [REST JSON] Link<br/>• [Defense Guide [F1]]", body_style),
         Paragraph("Provides one-click diagnostics: tests port 5000 server health, inspects raw JSON data for ORG-KID-8041, and launches guide.", body_style)]
    ]
    t_modals = Table(modals_btn_data, colWidths=[120, 110, 274])
    t_modals.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A246A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_modals)
    story.append(Spacer(1, 14))

    # ── SECTION 5: STEP-BY-STEP OPERATOR WORKFLOW ──────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("5. Step-by-Step Operator & Demonstrator Workflow", h1_style))
    p_steps = ("To perform a flawless live demonstration or operational audit, follow this chronological sequence:")
    story.append(Paragraph(p_steps, body_style))

    wf_guide = [
        ("Step 1: OPO Node Harvest & Registration",
         "1. In the top JToolBar, switch the consortium actor dropdown to 'Organ Procurement Org (OPO)'.\n"
         "2. Click the beveled '[Harvest Organ [F2]]' button to launch the JDialog registration modal.\n"
         "3. Select a preset template (e.g. 'Kidney (24h)' or 'Heart (4h Urgent)'). Notice automatic Form 8 donor consent hash generation.\n"
         "4. Click '[OK - Sign & Register Harvest]'. The organ is immediately anchored on the EVM blockchain."),
        ("Step 2: Cryo-Logistics Transit & Telemetry Logging",
         "1. Switch the actor dropdown to 'Medical Transit Logistics' (AeroMed Logistics).\n"
         "2. In the Organ Custody Registry, find your harvested organ and click the '[Transfer]' button.\n"
         "3. Select the destination node (NOTTO Clearinghouse or Hospital) and record probe temperature (2.4°C).\n"
         "4. Click '[OK - Sign Medical Handoff]'. Stage transitions to 'InTransit'."),
        ("Step 3: National Allocation Clearance & Recipient Matching",
         "1. Switch the actor dropdown to 'Allocation Authority' (NOTTO Regional Directorate).\n"
         "2. Audit HLA histocompatibility (6/6 match) and verify recipient queue priority.\n"
         "3. Execute handoff to the designated surgical hospital. Stage transitions to 'AllocationCleared'."),
        ("Step 4: Hospital Operating Suite Reception & Implantation",
         "1. Switch the actor dropdown to 'Transplant Hospital' (Apollo Multi-Specialty Surgical Center).\n"
         "2. Notice the organ is now in 'HospitalReceived' status in the surgical suite.\n"
         "3. Click the '[Implant]' button. Enter surgical operating theater notes.\n"
         "4. Implantation is completed on-chain. State transitions permanently to 'Transplanted' (Grafted)."),
        ("Step 5: Public Provenance Inspection & Anti-Trafficking Audit",
         "1. Navigate to 'Provenance' (VerifyPage).\n"
         "2. Click '[ORG-KID-8041]' or enter an organ ID to interrogate the ledger.\n"
         "3. Inspect the live cold ischemia window countdown, donor Form 8 IPFS CID, and complete custody timeline.\n"
         "4. Click '[ORG-FAKE-999]' to illustrate automated detection of unregistered organs and illegal trafficking alerts.")
    ]

    for title, text in wf_guide:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        for line in text.split('\n'):
            story.append(Paragraph(line, body_style))
        story.append(Spacer(1, 4))

    # ── SECTION 6: VIVA DEFENSE & ACADEMIC TALKING POINTS ──────────────────
    story.append(Spacer(1, 8))
    story.append(Paragraph("6. Academic Defense: Why Blockchain vs. Traditional MongoDB/SQL?", h1_style))
    p_viva = ("When defending this project before examiners or regulatory auditors, emphasize these four foundational arguments:")
    story.append(Paragraph(p_viva, body_style))

    viva_points = [
        ("1. Multi-Stakeholder Mutual Distrust:",
         "OPOs, private air-ambulances, rival private hospital corporations, and federal health ministries do not trust each "
         "other with database administrative access. A centralized MongoDB database managed by Hospital A could allow a rogue "
         "DBA to covertly alter timestamps, swap recipient priorities, or delete cold-chain failure alerts."),
        ("2. Anti-Trafficking Non-Repudiation:",
         "Under human organ transplant laws (NOTA/THOTA), black-market commercial trafficking relies on forged donor consent. "
         "On LifeLedger, every organ requires cryptographic digital signatures tied to the OPO's private key and Form 8 IPFS CID. "
         "Once committed to an EVM block, provenance is immutable and permanent."),
        ("3. Programmable Invariant Enforcement:",
         "Smart contracts execute programmable law, not passive storage. If a cold-ischemia window has expired, or if a non-hospital "
         "entity attempts to sign off on a transplant, the EVM reverts the transaction with mathematical finality."),
        ("4. Zero-Volatility Proof-of-Authority Consensus:",
         "LifeLedger uses a PoA consortium consensus model where authenticated health ministry entities validate blocks. "
         "This eliminates volatile public gas fees and guarantees predictable 1-2 second transaction finality during medical emergencies.")
    ]

    for title, text in viva_points:
        story.append(Paragraph(f"<b>{title}</b> {text}", body_style))
        story.append(Spacer(1, 2))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {pdf_path}")

if __name__ == '__main__':
    docs_dir = os.path.join(os.getcwd(), 'docs')
    os.makedirs(docs_dir, exist_ok=True)
    
    arch_img = os.path.join(docs_dir, 'diagram_architecture.png')
    wf_img = os.path.join(docs_dir, 'diagram_workflow.png')
    pdf_out = os.path.join(docs_dir, 'LifeLedger_System_Architecture_and_UI_Specification_Report.pdf')
    
    # Also copy PDF to project root for easy user discovery
    root_pdf_out = os.path.join(os.getcwd(), 'LifeLedger_System_Architecture_and_UI_Specification_Report.pdf')

    print("Generating diagrams...")
    generate_diagrams(arch_img, wf_img)

    print("Building comprehensive PDF report...")
    build_pdf_report(pdf_out, arch_img, wf_img)
    build_pdf_report(root_pdf_out, arch_img, wf_img)
    print("PDF generation complete!")
