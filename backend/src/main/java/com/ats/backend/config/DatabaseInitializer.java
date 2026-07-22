package com.ats.backend.config;

import com.ats.backend.entity.Role;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.repository.RoleRepository;
import com.ats.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final com.ats.backend.repository.CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(RoleRepository roleRepository, UserRepository userRepository, com.ats.backend.repository.CompanyRepository companyRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().roleName(roleName).build());
            }
        }

        // Initialize a default ADMIN, COMPANY_ADMIN, RECRUITER, and CANDIDATE for testing convenience
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByRoleName(RoleName.ROLE_ADMIN).orElseThrow();
            Role companyAdminRole = roleRepository.findByRoleName(RoleName.ROLE_COMPANY_ADMIN).orElseThrow();
            Role recruiterRole = roleRepository.findByRoleName(RoleName.ROLE_RECRUITER).orElseThrow();
            Role candidateRole = roleRepository.findByRoleName(RoleName.ROLE_CANDIDATE).orElseThrow();

            com.ats.backend.entity.Company defaultCompany = com.ats.backend.entity.Company.builder()
                    .name("Acme Corp")
                    .domain("acme.com")
                    .hiringPreferences("Prefers candidates with strong hands-on coding and systems knowledge.")
                    .build();
            // We need to inject CompanyRepository to save it, or we can just save via a new field
            // Wait, let's see if we should inject CompanyRepository. Let's do that!
            // First let's write out the logic with companyRepository.
            defaultCompany = companyRepository.save(defaultCompany);

            userRepository.save(User.builder()
                    .fullName("System Admin")
                    .username("admin")
                    .email("admin@ats.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .enabled(true)
                    .build());

            userRepository.save(User.builder()
                    .fullName("Alice Admin")
                    .username("companyadmin")
                    .email("companyadmin@ats.com")
                    .password(passwordEncoder.encode("companyadmin123"))
                    .role(companyAdminRole)
                    .company(defaultCompany)
                    .enabled(true)
                    .build());

            userRepository.save(User.builder()
                    .fullName("John Recruiter")
                    .username("recruiter")
                    .email("recruiter@ats.com")
                    .password(passwordEncoder.encode("recruiter123"))
                    .role(recruiterRole)
                    .company(defaultCompany)
                    .enabled(true)
                    .build());

            userRepository.save(User.builder()
                    .fullName("Jane Candidate")
                    .username("candidate")
                    .email("candidate@ats.com")
                    .password(passwordEncoder.encode("candidate123"))
                    .role(candidateRole)
                    .enabled(true)
                    .build());

            System.out.println("ATS System initialized with default users:");
            System.out.println("  Admin: admin@ats.com / admin123");
            System.out.println("  Company Admin: companyadmin@ats.com / companyadmin123");
            System.out.println("  Recruiter: recruiter@ats.com / recruiter123");
            System.out.println("  Candidate: candidate@ats.com / candidate123");
        }
    }
}
