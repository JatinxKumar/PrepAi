/**
 * test_match_analysis_presentation.js
 * 
 * Isolated verification test suite for MatchAnalysisPresentationService.
 * Validates deterministic presentation layer, requirement grouping,
 * verified strengths identification, gap clustering, and evidence-grounded recommendations.
 */

const assert = require("assert");
const { buildMatchPresentation } = require("./MatchAnalysisPresentationService");

const run = async () => {
    console.log("=== Running MatchAnalysisPresentationService Isolated Tests ===");

    // 1. Mock Raw Match Analysis (from ResumeMatchService)
    const mockMatchAnalysis = {
        overallScore: 77,
        requiredScore: 86,
        preferredScore: 50,
        summary: { strong: 5, partial: 3, missing: 8 },
        strongRequirements: [
            {
                requirementId: "skill-0",
                type: "requiredSkill",
                requirement: "C/C++ development",
                importance: "required",
                status: "strong",
                confidence: 0.95,
                evidence: [
                    {
                        evidenceId: "skills-languages",
                        section: "skills",
                        title: "Skills: Languages",
                        score: 0.95,
                        text: "Skills (Languages): C/C++, Java, Python.",
                    },
                ],
                reason: "Strong semantic evidence found in skills (\"C/C++ development\") supporting C/C++ development.",
            },
            {
                requirementId: "skill-1",
                type: "requiredSkill",
                requirement: "Linux",
                importance: "required",
                status: "strong",
                confidence: 0.88,
                evidence: [
                    {
                        evidenceId: "experience-0",
                        section: "experience",
                        title: "Software Developer at Tech Solutions Inc",
                        score: 0.88,
                        text: "Role: Software Developer at Tech Solutions Inc. Period: 2022 - 2024. Location: San Francisco, CA. Responsibilities & Accomplishments: Developed backend services using Java and Spring Boot. Collaborated with cross-functional teams to deliver scalable microservices.",
                    },
                ],
                reason: "Strong semantic evidence found in experience (\"Software Developer at Tech Solutions Inc\") supporting Linux.",
            },
        ],
        partialRequirements: [
            {
                requirementId: "resp-0",
                type: "responsibility",
                requirement: "file systems",
                importance: "required",
                status: "partial",
                confidence: 0.75,
                evidence: [
                    {
                        evidenceId: "project-0",
                        section: "projects",
                        title: "Campus Connect Hub",
                        score: 0.75,
                        text: "Project: Campus Connect Hub. Description: A real-time collaboration platform for university research teams. Technologies: React, Node.js, MongoDB, Socket.io. Details: Built real-time messaging pipeline handling 10k daily active users. Implemented JWT authentication with role-based access control.",
                    },
                ],
                reason: "Related background found in projects (\"Campus Connect Hub\"), but direct hands-on evidence for file systems is partial.",
            },
        ],
        missingRequirements: [
            {
                requirementId: "skill-2",
                type: "requiredSkill",
                requirement: "Lustre",
                importance: "required",
                status: "missing",
                confidence: 0.95,
                evidence: [],
                reason: "No sufficiently relevant resume evidence was retrieved for this requirement.",
            },
            {
                requirementId: "skill-3",
                type: "requiredSkill",
                requirement: "EXAScaler",
                importance: "required",
                status: "missing",
                confidence: 0.95,
                evidence: [],
                reason: "No sufficiently relevant resume evidence was retrieved for this requirement.",
            },
        ],
    };

    // 2. Mock Job Analysis (from JobDescriptionService)
    const mockJobAnalysis = {
        jobTitle: "Senior Storage Systems Engineer",
        company: "DDN",
        requiredSkills: [
            { skill: "C/C++ development", category: "backend", importance: "required" },
            { skill: "Linux", category: "os", importance: "required" },
            { skill: "file systems", category: "storage", importance: "required" },
            { skill: "Lustre", category: "storage", importance: "required" },
            { skill: "EXAScaler", category: "storage", importance: "required" },
            { skill: "scalable storage", category: "storage", importance: "required" },
            { skill: "distributed systems", category: "infrastructure", importance: "required" },
            { skill: "storage troubleshooting", category: "support", importance: "required" },
            { skill: "DDN architecture", category: "domain", importance: "required" },
            { skill: "AI/GPU clusters", category: "ai", importance: "required" },
        ],
        preferredSkills: [
            { skill: "technical client discussions", category: "business", importance: "preferred" },
            { skill: "enterprise account management", category: "business", importance: "preferred" },
            { skill: "strategic partnerships", category: "business", importance: "preferred" },
            { skill: "market growth", category: "business", importance: "preferred" },
            { skill: "government accounts", category: "business", importance: "preferred" },
        ],
        responsibilities: [
            "technical client discussions",
            "enterprise account management",
            "strategic partnerships",
            "market growth",
            "government accounts",
        ],
        qualifications: [],
        experienceRequirements: [],
        toolsAndTechnologies: [],
        softSkills: [],
    };

    // 3. Mock Structured Resume (from ResumeStructuringService)
    const mockStructuredResume = {
        personal: {
            name: "Jordan Developer",
            email: "jordan@example.com",
            phone: "555-0199",
            location: "San Francisco, CA",
            linkedin: "linkedin.com/in/jordandeveloper",
            github: "github.com/jordandeveloper",
        },
        summary: "Full Stack Engineer with 3+ years building high-throughput web applications and REST APIs.",
        skills: {
            languages: ["C/C++", "Java", "Python"],
            frameworks: ["React", "Node.js", "Express"],
            databases: ["MongoDB"],
            tools: ["Git", "Docker"],
        },
        experience: [
            {
                company: "Tech Solutions Inc",
                role: "Software Developer",
                location: "San Francisco, CA",
                startDate: "2022-01",
                endDate: "2024-03",
                bullets: [
                    "Developed backend services using Java and Spring Boot.",
                    "Collaborated with cross-functional teams to deliver scalable microservices.",
                ],
            },
        ],
        projects: [
            {
                name: "Campus Connect Hub",
                description: "A real-time collaboration platform for university research teams.",
                technologies: ["React", "Node.js", "MongoDB", "Socket.io"],
                bullets: [
                    "Built real-time messaging pipeline handling 10k daily active users.",
                    "Implemented JWT authentication with role-based access control.",
                ],
            },
        ],
        education: [
            {
                institution: "State University",
                degree: "Bachelor of Science",
                field: "Computer Science",
                startDate: "2018-09",
                endDate: "2022-05",
                details: ["Graduated Magna Cum Laude"],
            },
        ],
        achievements: [
            "First Place Winner at HackSF 2023 for building AI-assisted accessibility tool.",
        ],
        certifications: [
            "AWS Certified Solutions Architect – Associate",
        ],
    };

    // 4. Execute Presentation Builder
    const presentation = buildMatchPresentation(
        mockMatchAnalysis,
        mockJobAnalysis,
        mockStructuredResume
    );

    console.log("Presentation Overview:", {
        overallScore: presentation.overview.overallScore,
        verifiedStrengthsCount: presentation.verifiedStrengths.length,
        jobNeedsCategories: Object.keys(presentation.jobNeeds || {}).length,
        gapsClustersCount: Object.keys(presentation.groupedGaps?.clusters || {}).length,
        recommendationsCount: presentation.recommendations.length,
    });

    // Test 1: Presentation structure exists
    assert.ok(presentation, "Presentation should not be null");
    assert.ok(presentation.overview, "Presentation should have overview");
    assert.ok(presentation.verifiedStrengths, "Presentation should have verifiedStrengths");
    assert.ok(presentation.jobNeeds, "Presentation should have jobNeeds");
    assert.ok(presentation.groupedGaps, "Presentation should have groupedGaps");
    assert.ok(presentation.recommendations, "Presentation should have recommendations");

    // Test 2: Overview contains expected fields
    assert.strictEqual(presentation.overview.overallScore, 77, "Overall score should be 77");
    assert.strictEqual(presentation.overview.requiredScore, 86, "Required score should be 86");
    assert.strictEqual(presentation.overview.preferredScore, 50, "Preferred score should be 50");
    assert.ok(presentation.overview.scoreLabel.includes("Verified Match"), "Score label should mention verified match");
    assert.ok(presentation.overview.scoreSubtitle, "Score subtitle should be set");
    assert.ok(presentation.overview.scoreSubtitle.includes("evidence"), "Score subtitle should mention evidence");

    // Test 3: Verified strengths are extracted correctly
    assert.ok(presentation.verifiedStrengths.length > 0, "Should have at least one verified strength");
    const cPlusPlusStrength = presentation.verifiedStrengths.find((s) => s.requirement === "C/C++ development");
    assert.ok(cPlusPlusStrength, "Should find C/C++ development in verified strengths");
    assert.strictEqual(cPlusPlusStrength.status, "strong", "C/C++ should be strong");
    assert.ok(cPlusPlusStrength.evidence, "C/C++ should have evidence");

    // Test 4: Job needs are categorized
    assert.ok(Object.keys(presentation.jobNeeds).length > 0, "Should have categorized job needs");
    const hasTechnicalSkills = Object.keys(presentation.jobNeeds).some((cat) => cat.includes("Technical"));
    assert.ok(hasTechnicalSkills, "Should have Technical & Programming Skills category");

    // Test 5: Gaps are grouped (Lustre, EXAScaler, file systems should be grouped)
    assert.ok(presentation.groupedGaps, "Should have grouped gaps");
    assert.ok(presentation.groupedGaps.clusters, "Should have gap clusters");
    const hasStorageCluster = Object.keys(presentation.groupedGaps.clusters).some((cat) =>
      cat.includes("Storage") || cat.includes("Systems") || cat.includes("Infrastructure")
    );
    assert.ok(hasStorageCluster, "Should have a cluster for Lustre, EXAScaler, file systems");

    // Test 6: Recommendations are evidence-grounded
    assert.ok(presentation.recommendations.length > 0, "Should have recommendations");
    const hasUnsupportedRec = presentation.recommendations.some((r) => r.type === "unsupported");
    assert.ok(hasUnsupportedRec, "Should have unsupported recommendation for missing Lustre/EXAScaler");

    // Test 7: Every original atomic requirement is preserved somewhere
    const allOriginalRequirements = [
        ...mockMatchAnalysis.strongRequirements.map((r) => r.requirement),
        ...mockMatchAnalysis.partialRequirements.map((r) => r.requirement),
        ...mockMatchAnalysis.missingRequirements.map((r) => r.requirement),
    ];
    const allPresentationRequirements = [
        ...presentation.verifiedStrengths.map((s) => s.requirement),
        ...Object.values(presentation.groupedGaps?.clusters || {}).flatMap((groups) =>
            groups.flatMap((group) => group.items.map((item) => item.requirement))
        ),
        ...Object.values(presentation.jobNeeds || {}).flatMap((items) => items.map((item) => item.text)),
    ];
    for (const req of allOriginalRequirements) {
        const found = allPresentationRequirements.some((presReq) => presReq.toLowerCase() === req.toLowerCase());
        assert.ok(found, `Original requirement '${req}' should be preserved in presentation`);
    }

    // Test 8: No duplicate presentation entries for same requirement
    const seen = new Set();
    for (const strength of presentation.verifiedStrengths) {
        const norm = strength.requirement.toLowerCase().trim();
        assert.ok(!seen.has(norm), `Duplicate verified strength: ${strength.requirement}`);
        seen.add(norm);
    }

    // Test 9: Different JD domain works (test with generic software engineer JD)
    const genericJobAnalysis = {
        jobTitle: "Software Engineer",
        requiredSkills: [
            { skill: "React", category: "frontend", importance: "required" },
            { skill: "Node.js", category: "backend", importance: "required" },
            { skill: "PostgreSQL", category: "database", importance: "required" },
        ],
        preferredSkills: [
            { skill: "AWS", category: "cloud", importance: "preferred" },
        ],
        responsibilities: ["Build REST APIs"],
        qualifications: [],
        experienceRequirements: [],
        toolsAndTechnologies: [],
        softSkills: [],
    };

    const genericPresentation = buildMatchPresentation(
        mockMatchAnalysis,
        genericJobAnalysis,
        mockStructuredResume
    );

    assert.ok(genericPresentation, "Should handle generic JD domain");
    assert.ok(genericPresentation.jobNeeds, "Should categorize generic JD requirements");

    // Test 10: Empty/partial job analysis handled safely
    const emptyJobAnalysis = {};
    const emptyPresentation = buildMatchPresentation(
        mockMatchAnalysis,
        emptyJobAnalysis,
        mockStructuredResume
    );
    assert.ok(emptyPresentation, "Should handle empty job analysis");
    assert.ok(emptyPresentation.jobNeeds, "Should have empty job needs for empty analysis");

    // Test 11: Missing evidence handled safely
    const matchWithMissingEvidence = {
        overallScore: 0,
        requiredScore: 0,
        preferredScore: 0,
        summary: { strong: 0, partial: 0, missing: 2 },
        strongRequirements: [],
        partialRequirements: [],
        missingRequirements: [
            {
                requirementId: "skill-4",
                type: "requiredSkill",
                requirement: "Unknown Technology",
                importance: "required",
                status: "missing",
                confidence: 0.95,
                evidence: [],
                reason: "No sufficiently relevant resume evidence was retrieved for this requirement.",
            },
        ],
    };

    const missingEvidencePresentation = buildMatchPresentation(
        matchWithMissingEvidence,
        mockJobAnalysis,
        mockStructuredResume
    );
    assert.ok(missingEvidencePresentation, "Should handle missing evidence");
    assert.ok(missingEvidencePresentation.groupedGaps, "Should have grouped gaps for missing evidence");

    console.log("✅ ALL MATCH ANALYSIS PRESENTATION TESTS PASSED SUCCESSFULLY!");
};

run().catch((err) => {
    console.error("❌ Match analysis presentation test failed:", err);
    process.exit(1);
});